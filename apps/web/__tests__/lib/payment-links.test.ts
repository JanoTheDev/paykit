import { describe, it, expect } from "vitest";
import { resolvePaymentLink, type PaymentLinkRow } from "../../lib/payment-links";

const now = new Date("2026-04-22T12:00:00Z");

function base(overrides: Partial<PaymentLinkRow> = {}): PaymentLinkRow {
  return {
    id: "link_1",
    organizationId: "org_1",
    productId: "prod_1",
    name: "Support link",
    customerId: null,
    networkKey: null,
    tokenSymbol: null,
    isActive: true,
    maxRedemptions: null,
    redemptionCount: 0,
    metadata: null,
    livemode: false,
    ...overrides,
  };
}

describe("resolvePaymentLink", () => {
  it("produces awaiting_currency session when link has no currency lock", () => {
    const res = resolvePaymentLink({
      link: base(),
      productType: "one_time",
      lockedPrice: null,
      now,
      sessionTtlMs: 30 * 60 * 1000,
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.sessionValues.status).toBe("awaiting_currency");
    expect(res.sessionValues.amount).toBe(0n);
    expect(res.sessionValues.networkKey).toBeNull();
    expect(res.sessionValues.expiresAt.getTime()).toBe(
      now.getTime() + 30 * 60 * 1000,
    );
  });

  it("locks to the given price when link is pre-locked", () => {
    const res = resolvePaymentLink({
      link: base({ networkKey: "base", tokenSymbol: "USDC" }),
      productType: "subscription",
      lockedPrice: {
        networkKey: "base",
        tokenSymbol: "USDC",
        amount: 1_000_000n,
        merchantWallet: "0xabcdef0123456789abcdef0123456789abcdef01",
      },
      now,
      sessionTtlMs: 30 * 60 * 1000,
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.sessionValues.status).toBe("active");
    expect(res.sessionValues.amount).toBe(1_000_000n);
    expect(res.sessionValues.type).toBe("subscription");
    expect(res.sessionValues.merchantWallet).toBe(
      "0xabcdef0123456789abcdef0123456789abcdef01",
    );
  });

  it("rejects inactive links", () => {
    const res = resolvePaymentLink({
      link: base({ isActive: false }),
      productType: "one_time",
      lockedPrice: null,
      now,
      sessionTtlMs: 1000,
    });
    expect(res).toEqual({ ok: false, reason: "not_active" });
  });

  it("rejects exhausted links", () => {
    const res = resolvePaymentLink({
      link: base({ maxRedemptions: 3, redemptionCount: 3 }),
      productType: "one_time",
      lockedPrice: null,
      now,
      sessionTtlMs: 1000,
    });
    expect(res).toEqual({ ok: false, reason: "exhausted" });
  });

  it("rejects when locked but price missing or mismatched", () => {
    const link = base({ networkKey: "base", tokenSymbol: "USDC" });
    expect(
      resolvePaymentLink({
        link,
        productType: "one_time",
        lockedPrice: null,
        now,
        sessionTtlMs: 1000,
      }),
    ).toEqual({ ok: false, reason: "missing_price" });

    expect(
      resolvePaymentLink({
        link,
        productType: "one_time",
        lockedPrice: {
          networkKey: "base",
          tokenSymbol: "WRONG",
          amount: 1n,
          merchantWallet: "0x0000000000000000000000000000000000000000",
        },
        now,
        sessionTtlMs: 1000,
      }),
    ).toEqual({ ok: false, reason: "missing_price" });
  });

  it("inherits metadata, customerId, livemode from the link", () => {
    const res = resolvePaymentLink({
      link: base({
        customerId: "cust_42",
        livemode: true,
        metadata: { source: "twitter" },
      }),
      productType: "one_time",
      lockedPrice: null,
      now,
      sessionTtlMs: 1000,
    });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.sessionValues.customerId).toBe("cust_42");
    expect(res.sessionValues.livemode).toBe(true);
    expect(res.sessionValues.metadata).toEqual({ source: "twitter" });
  });
});
