/**
 * Pure helpers that verify an on-chain USDC transfer is a valid refund
 * for a given payment row. The API route fetches the receipt via viem;
 * this module just interprets the decoded logs.
 */

export interface Erc20TransferLog {
  token: string;     // contract address of the token
  from: string;      // sender (merchant for a refund)
  to: string;        // recipient (original payer for a refund)
  value: bigint;     // transferred amount in token base units
}

export type VerifyRefundInput = {
  /** Parsed USDC Transfer events from the refund tx receipt. */
  transferLogs: Erc20TransferLog[];
  /** The payment this refund is against. */
  payment: {
    /** Original buyer wallet — refund recipient. */
    fromAddress: string;
    /** Original merchant wallet — refund sender. */
    toAddress: string;
    /** Cents already refunded; new refund + this must not exceed amount. */
    refundedCents: number;
    /** Total charged in cents. */
    amountCents: number;
  };
  /** Canonical USDC address for the payment's network (lowercased). */
  usdcAddress: string;
  /** Refund amount in cents the merchant is trying to record. */
  refundCents: number;
  /** USDC-6-decimal conversion. base_units_per_cent = 10_000. */
  baseUnitsPerCent: bigint;
};

export type VerifyResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "no_transfer"
        | "wrong_token"
        | "wrong_sender"
        | "wrong_recipient"
        | "insufficient_amount"
        | "over_refund"
        | "invalid_amount";
    };

export function verifyRefund(input: VerifyRefundInput): VerifyResult {
  const { payment, refundCents, usdcAddress, transferLogs, baseUnitsPerCent } =
    input;

  if (!Number.isFinite(refundCents) || refundCents <= 0) {
    return { ok: false, reason: "invalid_amount" };
  }
  if (payment.refundedCents + refundCents > payment.amountCents) {
    return { ok: false, reason: "over_refund" };
  }

  const expectedBaseUnits = BigInt(refundCents) * baseUnitsPerCent;
  const expectedToken = usdcAddress.toLowerCase();
  const expectedFrom = payment.toAddress.toLowerCase();
  const expectedTo = payment.fromAddress.toLowerCase();

  // Find any transfer that matches token + direction; pick the first
  // with value >= expected. Merchants may send slightly more than the
  // exact refund (e.g. on-chain rounding), so >= is safer than ==.
  let sawToken = false;
  let sawDirection = false;
  let enough = false;
  for (const log of transferLogs) {
    const token = log.token.toLowerCase();
    if (token !== expectedToken) continue;
    sawToken = true;
    const from = log.from.toLowerCase();
    const to = log.to.toLowerCase();
    if (from !== expectedFrom || to !== expectedTo) continue;
    sawDirection = true;
    if (log.value >= expectedBaseUnits) {
      enough = true;
      break;
    }
  }

  if (transferLogs.length === 0) return { ok: false, reason: "no_transfer" };
  if (!sawToken) return { ok: false, reason: "wrong_token" };
  if (!sawDirection) {
    // Distinguish whether the sender or the recipient is wrong for a
    // clearer dashboard error. Cheaper than scanning twice.
    const senderMatchesSomewhere = transferLogs.some(
      (l) =>
        l.token.toLowerCase() === expectedToken &&
        l.from.toLowerCase() === expectedFrom,
    );
    return {
      ok: false,
      reason: senderMatchesSomewhere ? "wrong_recipient" : "wrong_sender",
    };
  }
  if (!enough) return { ok: false, reason: "insufficient_amount" };
  return { ok: true };
}
