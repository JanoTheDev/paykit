export const PER_WALLET_DAILY_LIMIT_WEI = 1_000_000_000n;

export const GLOBAL_DAILY_LIMIT_WEI = 100_000_000_000n;

export const FAUCET_WINDOW_MS = 24 * 60 * 60 * 1000;

export type FaucetLimitDecision =
  | { ok: true }
  | { ok: false; code: "wallet_limit_exceeded" | "global_limit_exceeded"; reason: string };

export interface FaucetLimitInput {
  walletAddress: string;
  requestedAmount: bigint;
  walletMintedInWindow: bigint;
  globalMintedInWindow: bigint;
  now: Date;
}

export function checkFaucetLimits(input: FaucetLimitInput): FaucetLimitDecision {
  const newWalletTotal = input.walletMintedInWindow + input.requestedAmount;
  if (newWalletTotal > PER_WALLET_DAILY_LIMIT_WEI) {
    return {
      ok: false,
      code: "wallet_limit_exceeded",
      reason: `Wallet ${input.walletAddress} would exceed the ${PER_WALLET_DAILY_LIMIT_WEI / 1_000_000n} MockUSDC per-24h limit`,
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
