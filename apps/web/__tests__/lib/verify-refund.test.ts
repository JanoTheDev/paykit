import { describe, it, expect } from "vitest";
import { verifyRefund, type Erc20TransferLog } from "../../lib/verify-refund";

const USDC = "0xUSDC0000000000000000000000000000000000";
const MERCHANT = "0xMERCHANT00000000000000000000000000000";
const BUYER = "0xBUYER00000000000000000000000000000000";
const OTHER = "0xOTHER00000000000000000000000000000000";
const BASE_PER_CENT = 10_000n; // USDC 6 decimals

function base(
  overrides: Partial<Parameters<typeof verifyRefund>[0]> = {},
): Parameters<typeof verifyRefund>[0] {
  return {
    transferLogs: [
      {
        token: USDC,
        from: MERCHANT,
        to: BUYER,
        value: 1_000_000n, // 100 cents in base units
      } as Erc20TransferLog,
    ],
    payment: {
      fromAddress: BUYER,
      toAddress: MERCHANT,
      refundedCents: 0,
      amountCents: 1000,
    },
    usdcAddress: USDC,
    refundCents: 100,
    baseUnitsPerCent: BASE_PER_CENT,
    ...overrides,
  };
}

describe("verifyRefund", () => {
  it("accepts a valid merchant → buyer USDC transfer at the right amount", () => {
    expect(verifyRefund(base())).toEqual({ ok: true });
  });

  it("rejects zero or negative refund cents", () => {
    expect(verifyRefund(base({ refundCents: 0 })).ok).toBe(false);
    expect(verifyRefund(base({ refundCents: -5 })).ok).toBe(false);
  });

  it("rejects over-refund beyond the original charge", () => {
    expect(
      verifyRefund(
        base({
          refundCents: 1001,
          payment: {
            fromAddress: BUYER,
            toAddress: MERCHANT,
            refundedCents: 0,
            amountCents: 1000,
          },
        }),
      ),
    ).toEqual({ ok: false, reason: "over_refund" });
  });

  it("rejects cumulative over-refund", () => {
    expect(
      verifyRefund(
        base({
          refundCents: 500,
          payment: {
            fromAddress: BUYER,
            toAddress: MERCHANT,
            refundedCents: 600,
            amountCents: 1000,
          },
        }),
      ),
    ).toEqual({ ok: false, reason: "over_refund" });
  });

  it("rejects when tx has no transfer logs", () => {
    expect(verifyRefund(base({ transferLogs: [] }))).toEqual({
      ok: false,
      reason: "no_transfer",
    });
  });

  it("rejects a transfer of a different token", () => {
    expect(
      verifyRefund(
        base({
          transferLogs: [
            {
              token: "0xdeadbeef000000000000000000000000000000",
              from: MERCHANT,
              to: BUYER,
              value: 1_000_000n,
            },
          ],
        }),
      ),
    ).toEqual({ ok: false, reason: "wrong_token" });
  });

  it("rejects when merchant sent to the wrong recipient", () => {
    expect(
      verifyRefund(
        base({
          transferLogs: [
            { token: USDC, from: MERCHANT, to: OTHER, value: 1_000_000n },
          ],
        }),
      ),
    ).toEqual({ ok: false, reason: "wrong_recipient" });
  });

  it("rejects when sender isn't the merchant", () => {
    expect(
      verifyRefund(
        base({
          transferLogs: [
            { token: USDC, from: OTHER, to: BUYER, value: 1_000_000n },
          ],
        }),
      ),
    ).toEqual({ ok: false, reason: "wrong_sender" });
  });

  it("rejects when the transfer value is less than the refund", () => {
    expect(
      verifyRefund(
        base({
          transferLogs: [
            { token: USDC, from: MERCHANT, to: BUYER, value: 500_000n },
          ],
        }),
      ),
    ).toEqual({ ok: false, reason: "insufficient_amount" });
  });

  it("accepts a transfer slightly larger than the refund (over-send)", () => {
    expect(
      verifyRefund(
        base({
          transferLogs: [
            {
              token: USDC,
              from: MERCHANT,
              to: BUYER,
              value: 1_000_001n,
            },
          ],
        }),
      ),
    ).toEqual({ ok: true });
  });

  it("accepts a multi-log tx where one log is the valid refund", () => {
    expect(
      verifyRefund(
        base({
          transferLogs: [
            { token: USDC, from: MERCHANT, to: OTHER, value: 50n },
            { token: USDC, from: MERCHANT, to: BUYER, value: 1_000_000n },
          ],
        }),
      ),
    ).toEqual({ ok: true });
  });

  it("compares addresses case-insensitively", () => {
    expect(
      verifyRefund(
        base({
          transferLogs: [
            {
              token: USDC.toUpperCase(),
              from: MERCHANT.toUpperCase(),
              to: BUYER.toUpperCase(),
              value: 1_000_000n,
            },
          ],
        }),
      ),
    ).toEqual({ ok: true });
  });
});
