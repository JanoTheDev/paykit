import { describe, it, expect } from "vitest";
import { toNativeUnits, fromNativeUnits, formatNativeAmount } from "../amounts";

describe("toNativeUnits", () => {
  it("converts USDC (6 decimals) from string", () => {
    expect(toNativeUnits("10.00", 6)).toBe(10_000_000n);
    expect(toNativeUnits("0.01", 6)).toBe(10_000n);
    expect(toNativeUnits("1", 6)).toBe(1_000_000n);
  });

  it("converts ETH (18 decimals) from string", () => {
    expect(toNativeUnits("0.003", 18)).toBe(3_000_000_000_000_000n);
    expect(toNativeUnits("1", 18)).toBe(1_000_000_000_000_000_000n);
  });

  it("handles trailing/leading whitespace", () => {
    expect(toNativeUnits("  10.00  ", 6)).toBe(10_000_000n);
  });

  it("throws on invalid input", () => {
    expect(() => toNativeUnits("abc", 6)).toThrow();
    expect(() => toNativeUnits("", 6)).toThrow();
    expect(() => toNativeUnits("-10", 6)).toThrow(/positive/);
  });

  it("throws when input has more decimals than the token supports", () => {
    expect(() => toNativeUnits("0.0000001", 6)).toThrow(/decimals/);
  });
});

describe("fromNativeUnits", () => {
  it("converts USDC native units back to human string", () => {
    expect(fromNativeUnits(10_000_000n, 6)).toBe("10");
    expect(fromNativeUnits(10_500_000n, 6)).toBe("10.5");
    expect(fromNativeUnits(10_000n, 6)).toBe("0.01");
  });

  it("converts ETH native units back to human string", () => {
    expect(fromNativeUnits(3_000_000_000_000_000n, 18)).toBe("0.003");
    expect(fromNativeUnits(1_000_000_000_000_000_000n, 18)).toBe("1");
  });

  it("strips trailing zeros", () => {
    expect(fromNativeUnits(10_000_000n, 6)).toBe("10");
  });
});

describe("formatNativeAmount", () => {
  it("formats with symbol", () => {
    expect(formatNativeAmount(10_000_000n, 6, "USDC")).toBe("10 USDC");
    expect(formatNativeAmount(3_000_000_000_000_000n, 18, "ETH")).toBe(
      "0.003 ETH",
    );
  });
});
