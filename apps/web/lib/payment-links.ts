/**
 * Pure helper: given a payment-link row and a matching product-price
 * row, produce the values for the checkout_sessions insert that the
 * public /pay/[linkId] route will perform.
 *
 * Kept side-effect-free so redemption-count enforcement can be tested
 * against these values without a live DB.
 */

export interface PaymentLinkRow {
  id: string;
  organizationId: string;
  productId: string;
  name: string;
  customerId: string | null;
  networkKey: string | null;
  tokenSymbol: string | null;
  isActive: boolean;
  maxRedemptions: number | null;
  redemptionCount: number;
  metadata: Record<string, string> | null;
  livemode: boolean;
}

export interface LockedPrice {
  networkKey: string;
  tokenSymbol: string;
  amount: bigint;
  merchantWallet: `0x${string}`;
}

export type LinkResolution =
  | { ok: true; sessionValues: NewSessionValues }
  | { ok: false; reason: "not_active" | "exhausted" | "missing_price" };

export interface NewSessionValues {
  organizationId: string;
  productId: string;
  customerId: string | null;
  merchantWallet: `0x${string}`;
  amount: bigint;
  networkKey: string | null;
  tokenSymbol: string | null;
  status: "active" | "awaiting_currency";
  type: "one_time" | "subscription";
  metadata: Record<string, string>;
  expiresAt: Date;
  livemode: boolean;
}

/**
 * Compose the values for a new checkout_sessions row spawned from a
 * payment link. Does not mutate state or query the DB.
 *
 * Rules:
 * - Inactive link → reject.
 * - Exhausted link → reject.
 * - Link has (networkKey, tokenSymbol) → caller must supply the matching
 *   LockedPrice; status becomes "active".
 * - Link has no currency lock → status becomes "awaiting_currency" and
 *   the buyer picks on the checkout page.
 */
export function resolvePaymentLink(args: {
  link: PaymentLinkRow;
  productType: "one_time" | "subscription";
  lockedPrice: LockedPrice | null;
  now: Date;
  sessionTtlMs: number;
}): LinkResolution {
  const { link, productType, lockedPrice, now, sessionTtlMs } = args;
  if (!link.isActive) return { ok: false, reason: "not_active" };
  if (
    link.maxRedemptions !== null &&
    link.redemptionCount >= link.maxRedemptions
  ) {
    return { ok: false, reason: "exhausted" };
  }

  if (link.networkKey && link.tokenSymbol) {
    if (!lockedPrice) return { ok: false, reason: "missing_price" };
    if (
      lockedPrice.networkKey !== link.networkKey ||
      lockedPrice.tokenSymbol !== link.tokenSymbol
    ) {
      return { ok: false, reason: "missing_price" };
    }
  }

  const values: NewSessionValues = {
    organizationId: link.organizationId,
    productId: link.productId,
    customerId: link.customerId,
    merchantWallet: lockedPrice?.merchantWallet ?? "0x0000000000000000000000000000000000000000",
    amount: lockedPrice ? lockedPrice.amount : 0n,
    networkKey: link.networkKey,
    tokenSymbol: link.tokenSymbol,
    status: lockedPrice ? "active" : "awaiting_currency",
    type: productType,
    metadata: link.metadata ?? {},
    expiresAt: new Date(now.getTime() + sessionTtlMs),
    livemode: link.livemode,
  };

  return { ok: true, sessionValues: values };
}
