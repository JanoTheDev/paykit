import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { payments, refundRequests } from "@paylix/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { verifyPortalToken } from "@/lib/portal-tokens";
import { dispatchWebhooks } from "@/lib/webhook-dispatch";
import { apiError } from "@/lib/api-error";

const schema = z.object({
  paymentId: z.string().uuid(),
  customerId: z.string().uuid(),
  token: z.string(),
  amount: z.number().int().min(1),
  reason: z.string().max(500).optional(),
});

/**
 * Customer-initiated refund request. Portal-token authenticated.
 * Creates a pending row; merchant reviews via the dashboard.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "validation_failed",
      parsed.error.issues.map((i) => i.message).join("; "),
    );
  }
  const { paymentId, customerId, token, amount, reason } = parsed.data;

  if (!verifyPortalToken(token, customerId)) {
    return apiError("invalid_token", "Invalid or expired portal token", 401);
  }

  const [payment] = await db
    .select()
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);
  if (!payment) return apiError("not_found", "Payment not found", 404);
  if (payment.customerId !== customerId) {
    return apiError("forbidden", "Not your payment", 403);
  }
  if (payment.status !== "confirmed") {
    return apiError(
      "invalid_status",
      "Only confirmed payments can be refunded",
      409,
    );
  }
  if (payment.refundedCents + amount > payment.amount) {
    return apiError("over_refund", "Request exceeds remaining amount", 409);
  }

  try {
    const [row] = await db
      .insert(refundRequests)
      .values({
        organizationId: payment.organizationId,
        paymentId,
        customerId,
        amount,
        reason: reason ?? null,
        livemode: payment.livemode,
      })
      .returning();

    void dispatchWebhooks(payment.organizationId, "refund.requested", {
      refundRequestId: row.id,
      paymentId,
      customerId,
      amount,
      reason: reason ?? null,
    }).catch((err) =>
      console.error("[refund-request] webhook failed:", err),
    );

    return NextResponse.json(row, { status: 201 });
  } catch {
    return apiError(
      "duplicate",
      "An open refund request already exists for this payment",
      409,
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const customerId = url.searchParams.get("customerId");
  if (!token || !customerId) {
    return apiError("invalid_body", "Missing token or customerId", 400);
  }
  if (!verifyPortalToken(token, customerId)) {
    return apiError("invalid_token", "Invalid or expired portal token", 401);
  }

  const rows = await db
    .select()
    .from(refundRequests)
    .where(eq(refundRequests.customerId, customerId))
    .orderBy(refundRequests.createdAt);

  return NextResponse.json(rows);
}
