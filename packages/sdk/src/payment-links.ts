import type { PaylixConfig } from "./types";

export interface CreatePaymentLinkParams {
  productId: string;
  name: string;
  customerId?: string;
  networkKey?: string;
  tokenSymbol?: string;
  maxRedemptions?: number;
  metadata?: Record<string, string>;
}

export interface PaymentLink {
  id: string;
  productId: string;
  name: string;
  customerId: string | null;
  networkKey: string | null;
  tokenSymbol: string | null;
  isActive: boolean;
  maxRedemptions: number | null;
  redemptionCount: number;
  metadata: Record<string, string> | null;
  createdAt: string;
}

export interface CreatePaymentLinkResult {
  link: PaymentLink;
  url: string;
}

export async function createPaymentLink(
  config: PaylixConfig,
  params: CreatePaymentLinkParams,
): Promise<CreatePaymentLinkResult> {
  const response = await fetch(`${config.backendUrl}/api/payment-links`, {
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
      .catch(() => ({ error: "Request failed" }))) as { error?: string };
    throw new Error(
      `Paylix payment link create failed: ${error.error || response.statusText}`,
    );
  }
  const link = (await response.json()) as PaymentLink;
  return { link, url: `${config.backendUrl}/pay/${link.id}` };
}

export async function listPaymentLinks(
  config: PaylixConfig,
): Promise<PaymentLink[]> {
  const response = await fetch(`${config.backendUrl}/api/payment-links`, {
    headers: { Authorization: `Bearer ${config.apiKey}` },
  });
  if (!response.ok) {
    throw new Error(`Paylix payment links list failed: ${response.statusText}`);
  }
  return (await response.json()) as PaymentLink[];
}

export async function archivePaymentLink(
  config: PaylixConfig,
  id: string,
): Promise<void> {
  const response = await fetch(`${config.backendUrl}/api/payment-links/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${config.apiKey}` },
  });
  if (!response.ok) {
    throw new Error(`Paylix payment link archive failed: ${response.statusText}`);
  }
}
