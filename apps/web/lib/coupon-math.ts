export type CouponType = "percent" | "fixed";
export type CouponDuration = "once" | "forever" | "repeating";

export interface CouponForMath {
  type: CouponType;
  percentOff: number | null;
  amountOffCents: number | null;
  duration: CouponDuration;
  durationInCycles: number | null;
  maxRedemptions: number | null;
  redemptionCount: number;
  redeemBy: Date | null;
  isActive: boolean;
}

export type CouponValidation =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "not_active"
        | "expired"
        | "exhausted"
        | "invalid_percent"
        | "invalid_amount";
    };

/**
 * Normalizes a merchant-entered code. Uppercase trim — we store the same
 * canonical form, so a case-insensitive unique constraint falls out of the
 * (org, code) unique index in the schema.
 */
export function canonicalCouponCode(input: string): string {
  return input.trim().toUpperCase();
}

export function validateCoupon(
  coupon: CouponForMath,
  now: Date,
): CouponValidation {
  if (!coupon.isActive) return { ok: false, reason: "not_active" };
  if (coupon.redeemBy && coupon.redeemBy.getTime() <= now.getTime()) {
    return { ok: false, reason: "expired" };
  }
  if (
    coupon.maxRedemptions !== null &&
    coupon.redemptionCount >= coupon.maxRedemptions
  ) {
    return { ok: false, reason: "exhausted" };
  }
  if (coupon.type === "percent") {
    if (
      coupon.percentOff === null ||
      coupon.percentOff <= 0 ||
      coupon.percentOff > 100
    ) {
      return { ok: false, reason: "invalid_percent" };
    }
  } else {
    if (coupon.amountOffCents === null || coupon.amountOffCents <= 0) {
      return { ok: false, reason: "invalid_amount" };
    }
  }
  return { ok: true };
}

/**
 * Computes the discount for a given pre-discount amount. Result is clamped
 * so totals never go negative. All amounts are integer cents.
 */
export function computeDiscountCents(
  coupon: Pick<CouponForMath, "type" | "percentOff" | "amountOffCents">,
  amountCents: number,
): number {
  if (amountCents <= 0) return 0;
  if (coupon.type === "percent") {
    if (!coupon.percentOff) return 0;
    // Floor so we never over-discount due to rounding (merchant-friendly).
    return Math.min(amountCents, Math.floor((amountCents * coupon.percentOff) / 100));
  }
  if (!coupon.amountOffCents) return 0;
  return Math.min(amountCents, coupon.amountOffCents);
}

/**
 * Decide whether a coupon still applies for a given cycle index (0-based).
 * cycle=0 is the first charge. For subscriptions:
 * - once: only cycle 0.
 * - forever: all cycles.
 * - repeating: cycles 0..durationInCycles-1.
 */
export function appliesToCycle(
  coupon: Pick<CouponForMath, "duration" | "durationInCycles">,
  cycle: number,
): boolean {
  if (cycle < 0) return false;
  switch (coupon.duration) {
    case "once":
      return cycle === 0;
    case "forever":
      return true;
    case "repeating":
      if (!coupon.durationInCycles || coupon.durationInCycles <= 0) return false;
      return cycle < coupon.durationInCycles;
  }
}
