/**
 * Maximum MockUSDC amount that can be requested in a single faucet mint call.
 * With 6 decimals: 1000 * 10^6 = 1_000_000_000.
 */
export const PER_MINT_MAX_WEI = 1_000_000_000n;

/**
 * Global daily cap: 100_000 MockUSDC. Protects the minter wallet's gas budget
 * against wallet-rotation abuse (spamming "generate new address, mint").
 */
export const GLOBAL_DAILY_LIMIT_WEI = 100_000_000_000n;

export const FAUCET_WINDOW_MS = 24 * 60 * 60 * 1000;

export type FaucetLimitDecision =
  | { ok: true }
  | {
      ok: false;
      code: "wallet_already_funded" | "global_limit_exceeded" | "amount_too_large";
      reason: string;
    };

export interface FaucetLimitInput {
  walletAddress: string;
  requestedAmount: bigint;
  /** Number of successful mints to this wallet in the last 24h. */
  walletMintsInWindow: number;
  /** Total raw amount minted globally in the last 24h. */
  globalMintedInWindow: bigint;
  now: Date;
}

/**
 * Pure rate-limit decision. Given the current state, decide whether a new
 * mint of `requestedAmount` for `walletAddress` should proceed.
 *
 * Rules (in this order):
 * 1. Requested amount must not exceed PER_MINT_MAX_WEI.
 * 2. Wallet must have zero successful mints in the last 24h.
 * 3. Global 24h total + requested must not exceed GLOBAL_DAILY_LIMIT_WEI.
 *
 * The caller is responsible for fetching the state from the DB. This function
 * does zero I/O.
 */
export function checkFaucetLimits(input: FaucetLimitInput): FaucetLimitDecision {
  if (input.requestedAmount > PER_MINT_MAX_WEI) {
    return {
      ok: false,
      code: "amount_too_large",
      reason: `Requested amount exceeds the ${PER_MINT_MAX_WEI / 1_000_000n} MockUSDC per-mint maximum`,
    };
  }

  if (input.walletMintsInWindow > 0) {
    return {
      ok: false,
      code: "wallet_already_funded",
      reason: `Wallet ${input.walletAddress} has already been funded in the last 24h. Try again tomorrow.`,
    };
  }

  const newGlobalTotal = input.globalMintedInWindow + input.requestedAmount;
  if (newGlobalTotal > GLOBAL_DAILY_LIMIT_WEI) {
    return {
      ok: false,
      code: "global_limit_exceeded",
      reason: `Faucet would exceed the ${GLOBAL_DAILY_LIMIT_WEI / 1_000_000n} MockUSDC daily global limit`,
    };
  }

  return { ok: true };
}
