import type { PaylixConfig } from "./types";

export interface RefundPaymentParams {
  paymentId: string;
  amount: number; // integer cents
  txHash: string; // 0x-prefixed 32-byte hex of the merchant → buyer USDC transfer
  reason?: string;
}

export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  reason: string | null;
  txHash: string;
  status: "pending" | "confirmed" | "failed";
  createdAt: string;
}

export async function refundPayment(
  config: PaylixConfig,
  params: RefundPaymentParams,
): Promise<Refund> {
  const { paymentId, ...body } = params;
  const res = await fetch(
    `${config.backendUrl}/api/payments/${paymentId}/refund`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    const err = (await res
      .json()
      .catch(() => ({ error: "Request failed" }))) as {
      error?: { message?: string } | string;
    };
    const msg =
      typeof err.error === "string"
        ? err.error
        : err.error?.message ?? res.statusText;
    throw new Error(`Paylix refund failed: ${msg}`);
  }
  return (await res.json()) as Refund;
}
