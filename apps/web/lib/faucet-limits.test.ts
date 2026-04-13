import { describe, it, expect } from "vitest";
import {
  checkFaucetLimits,
  PER_WALLET_DAILY_LIMIT_WEI,
  GLOBAL_DAILY_LIMIT_WEI,
} from "./faucet-limits";

describe("checkFaucetLimits", () => {
  const now = new Date("2026-04-12T12:00:00Z");
  const wallet = "0x1111111111111111111111111111111111111111";

  it("allows a mint when no prior mints exist", () => {
    const result = checkFaucetLimits({
      walletAddress: wallet,
      requestedAmount: 1_000_000_000n,
      walletMintedInWindow: 0n,
      globalMintedInWindow: 0n,
      now,
    });
    expect(result.ok).toBe(true);
  });

  it("denies when wallet total would exceed per-wallet daily cap", () => {
    const result = checkFaucetLimits({
      walletAddress: wallet,
      requestedAmount: 1_000_000_000n,
      walletMintedInWindow: PER_WALLET_DAILY_LIMIT_WEI,
      globalMintedInWindow: 0n,
      now,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("wallet_limit_exceeded");
    }
  });

  it("denies when global total would exceed daily cap", () => {
    const result = checkFaucetLimits({
      walletAddress: wallet,
      requestedAmount: 1_000_000_000n,
      walletMintedInWindow: 0n,
      globalMintedInWindow: GLOBAL_DAILY_LIMIT_WEI,
      now,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("global_limit_exceeded");
    }
  });

  it("allows exactly at the per-wallet cap boundary", () => {
    const result = checkFaucetLimits({
      walletAddress: wallet,
      requestedAmount: 1_000_000_000n,
      walletMintedInWindow: PER_WALLET_DAILY_LIMIT_WEI - 1_000_000_000n,
      globalMintedInWindow: 0n,
      now,
    });
    expect(result.ok).toBe(true);
  });

  it("rejects amounts over the per-wallet cap in a single request", () => {
    const result = checkFaucetLimits({
      walletAddress: wallet,
      requestedAmount: PER_WALLET_DAILY_LIMIT_WEI + 1n,
      walletMintedInWindow: 0n,
      globalMintedInWindow: 0n,
      now,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("wallet_limit_exceeded");
    }
  });
});
