import { describe, it, expect } from "vitest";
import {
  checkFaucetLimits,
  PER_MINT_MAX_WEI,
  GLOBAL_DAILY_LIMIT_WEI,
} from "./faucet-limits";

describe("checkFaucetLimits", () => {
  const now = new Date("2026-04-12T12:00:00Z");
  const wallet = "0x1111111111111111111111111111111111111111";

  it("allows a mint when the wallet has no mints in the window", () => {
    const result = checkFaucetLimits({
      walletAddress: wallet,
      requestedAmount: 1_000_000_000n,
      walletMintsInWindow: 0,
      globalMintedInWindow: 0n,
      now,
    });
    expect(result.ok).toBe(true);
  });

  it("denies when the wallet has already been funded in the window", () => {
    const result = checkFaucetLimits({
      walletAddress: wallet,
      requestedAmount: 1_000_000_000n,
      walletMintsInWindow: 1,
      globalMintedInWindow: 0n,
      now,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("wallet_already_funded");
  });

  it("denies when global total would exceed daily cap", () => {
    const result = checkFaucetLimits({
      walletAddress: wallet,
      requestedAmount: 1_000_000_000n,
      walletMintsInWindow: 0,
      globalMintedInWindow: GLOBAL_DAILY_LIMIT_WEI,
      now,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("global_limit_exceeded");
  });

  it("rejects amounts over the per-mint max", () => {
    const result = checkFaucetLimits({
      walletAddress: wallet,
      requestedAmount: PER_MINT_MAX_WEI + 1n,
      walletMintsInWindow: 0,
      globalMintedInWindow: 0n,
      now,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("amount_too_large");
  });

  it("allows exactly the per-mint max", () => {
    const result = checkFaucetLimits({
      walletAddress: wallet,
      requestedAmount: PER_MINT_MAX_WEI,
      walletMintsInWindow: 0,
      globalMintedInWindow: 0n,
      now,
    });
    expect(result.ok).toBe(true);
  });
});
