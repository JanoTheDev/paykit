import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { checkoutSessions, coupons } from "@paylix/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import {
  canonicalCouponCode,
  computeDiscountCents,
  validateCoupon,
  type CouponForMath,
} from "@/lib/coupon-math";
import { apiError } from "@/lib/api-error";

const applySchema = z.object({ code: z.string().min(2).max(40) });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = applySchema.safeParse(body);
  if (!parsed.success) {
    return apiError("validation_failed", "code is required");
  }
  const code = canonicalCouponCode(parsed.data.code);

  const [session] = await db
    .select()
    .from(checkoutSessions)
    .where(eq(checkoutSessions.id, id))
    .limit(1);
  if (!session) return apiError("not_found", "Checkout session not found", 404);
  if (session.status === "completed" || session.status === "expired") {
    return apiError("invalid_state", "Checkout is not open", 409);
  }
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    return apiError("invalid_state", "Checkout has expired", 409);
  }
  if (session.amount === 0n) {
    // Amount isn't known yet (awaiting_currency). Buyer must pick a currency first.
    return apiError("awaiting_currency", "Pick a currency before applying a coupon", 409);
  }
  if (session.type !== "one_time") {
    // v1: coupons only apply to one-time payments. Subscription support
    // requires per-cycle amount override on-chain (SubscriptionManager
    // stores a fixed amount). Tracked as follow-up.
    return apiError(
      "not_supported",
      "Coupons are not yet supported on subscriptions",
      409,
    );
  }

  const [coupon] = await db
    .select()
    .from(coupons)
    .where(
      and(
        eq(coupons.code, code),
        eq(coupons.organizationId, session.organizationId),
        eq(coupons.livemode, session.livemode),
      ),
    )
    .limit(1);
  if (!coupon) return apiError("not_found", "Coupon not found", 404);

  const couponForMath: CouponForMath = {
    type: coupon.type,
    percentOff: coupon.percentOff,
    amountOffCents: coupon.amountOffCents,
    duration: coupon.duration,
    durationInCycles: coupon.durationInCycles,
    maxRedemptions: coupon.maxRedemptions,
    redemptionCount: coupon.redemptionCount,
    redeemBy: coupon.redeemBy,
    isActive: coupon.isActive,
  };

  const validation = validateCoupon(couponForMath, new Date());
  if (!validation.ok) {
    return apiError("coupon_invalid", validation.reason, 409);
  }

  // v1: fixed-amount coupons are deferred until we standardise the
  // token-base-units-vs-cents conversion at the checkout boundary.
  // Percent coupons are unit-agnostic, so they ship first.
  if (coupon.type !== "percent") {
    return apiError(
      "not_supported",
      "Fixed-amount coupons are not yet supported on checkout",
      409,
    );
  }

  // Preserve the pre-discount amount on subtotalAmount (first apply only).
  // On subsequent swaps or removals we restore from this field so the
  // buyer never ends up with a silently compounded discount.
  const subtotal = session.subtotalAmount ?? session.amount;
  const subtotalScalar = Number(subtotal);
  const discount = computeDiscountCents(couponForMath, subtotalScalar);
  const newAmount = BigInt(Math.max(0, subtotalScalar - discount));

  await db
    .update(checkoutSessions)
    .set({
      appliedCouponId: coupon.id,
      discountCents: discount,
      subtotalAmount: subtotal,
      amount: newAmount,
    })
    .where(eq(checkoutSessions.id, id));

  return NextResponse.json({
    ok: true,
    couponId: coupon.id,
    code: coupon.code,
    type: coupon.type,
    percentOff: coupon.percentOff,
    amountOffCents: coupon.amountOffCents,
    duration: coupon.duration,
    durationInCycles: coupon.durationInCycles,
    discountCents: discount,
    subtotalAmount: subtotal.toString(),
    amount: newAmount.toString(),
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const [session] = await db
    .select()
    .from(checkoutSessions)
    .where(eq(checkoutSessions.id, id))
    .limit(1);
  if (!session) return apiError("not_found", "Checkout session not found", 404);

  await db
    .update(checkoutSessions)
    .set({
      appliedCouponId: null,
      discountCents: null,
      amount: session.subtotalAmount ?? session.amount,
      subtotalAmount: null,
    })
    .where(eq(checkoutSessions.id, id));

  return NextResponse.json({ ok: true });
}
