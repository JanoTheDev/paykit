import type { PaylixConfig } from "./types";

export type CouponType = "percent" | "fixed";
export type CouponDuration = "once" | "forever" | "repeating";

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  percentOff: number | null;
  amountOffCents: number | null;
  duration: CouponDuration;
  durationInCycles: number | null;
  maxRedemptions: number | null;
  redemptionCount: number;
  redeemBy: string | null;
  firstTimeCustomerOnly: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponParams {
  code: string;
  type: CouponType;
  percentOff?: number;
  amountOffCents?: number;
  duration: CouponDuration;
  durationInCycles?: number;
  maxRedemptions?: number;
  redeemBy?: string;
  firstTimeCustomerOnly?: boolean;
}

export async function createCoupon(
  config: PaylixConfig,
  params: CreateCouponParams,
): Promise<Coupon> {
  const response = await fetch(`${config.backendUrl}/api/coupons`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const error = (await response
      .json()
      .catch(() => ({ error: "Request failed" }))) as { error?: { message?: string } | string };
    const msg =
      typeof error.error === "string"
        ? error.error
        : error.error?.message ?? response.statusText;
    throw new Error(`Paylix coupon create failed: ${msg}`);
  }
  return (await response.json()) as Coupon;
}

export async function listCoupons(config: PaylixConfig): Promise<Coupon[]> {
  const response = await fetch(`${config.backendUrl}/api/coupons`, {
    headers: { Authorization: `Bearer ${config.apiKey}` },
  });
  if (!response.ok) {
    throw new Error(`Paylix coupon list failed: ${response.statusText}`);
  }
  return (await response.json()) as Coupon[];
}

export async function archiveCoupon(
  config: PaylixConfig,
  id: string,
): Promise<void> {
  const response = await fetch(`${config.backendUrl}/api/coupons/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${config.apiKey}` },
  });
  if (!response.ok) {
    throw new Error(`Paylix coupon archive failed: ${response.statusText}`);
  }
}

export interface ApplyCouponResult {
  ok: true;
  couponId: string;
  code: string;
  type: CouponType;
  percentOff: number | null;
  amountOffCents: number | null;
  duration: CouponDuration;
  durationInCycles: number | null;
  discountCents: number;
  subtotalAmount: string;
  amount: string;
}

export async function applyCouponToCheckout(
  config: PaylixConfig,
  sessionId: string,
  code: string,
): Promise<ApplyCouponResult> {
  const response = await fetch(
    `${config.backendUrl}/api/checkout/${sessionId}/apply-coupon`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({ code }),
    },
  );
  if (!response.ok) {
    const error = (await response
      .json()
      .catch(() => ({ error: "Request failed" }))) as { error?: { message?: string } | string };
    const msg =
      typeof error.error === "string"
        ? error.error
        : error.error?.message ?? response.statusText;
    throw new Error(`Paylix apply coupon failed: ${msg}`);
  }
  return (await response.json()) as ApplyCouponResult;
}

export async function removeCouponFromCheckout(
  config: PaylixConfig,
  sessionId: string,
): Promise<void> {
  const response = await fetch(
    `${config.backendUrl}/api/checkout/${sessionId}/apply-coupon`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${config.apiKey}` },
    },
  );
  if (!response.ok) {
    throw new Error(`Paylix remove coupon failed: ${response.statusText}`);
  }
}
