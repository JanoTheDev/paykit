import { describe, it, expect } from "vitest";
import {
  formatAmount,
  formatDate,
  formatDateTime,
  truncateAddress,
  truncateHash,
  explorerUrl,
} from "./format";

describe("formatAmount", () => {
  it("formats cents as dollar string with two decimals", () => {
    expect(formatAmount(1000)).toBe("$10.00");
    expect(formatAmount(0)).toBe("$0.00");
    expect(formatAmount(1)).toBe("$0.01");
    expect(formatAmount(1234567)).toBe("$12,345.67");
  });
  it("handles negative values", () => {
    expect(formatAmount(-500)).toBe("-$5.00");
  });
});

describe("formatDate", () => {
  it("returns month day, year", () => {
    const d = new Date("2026-04-10T12:00:00Z");
    expect(formatDate(d)).toMatch(/Apr 10, 2026/);
  });
});

describe("formatDateTime", () => {
  it("returns date with time", () => {
    const d = new Date("2026-04-10T15:42:00Z");
    const out = formatDateTime(d);
    expect(out).toMatch(/Apr 10, 2026/);
    expect(out).toMatch(/:/);
  });
});

describe("truncateAddress", () => {
  it("truncates 42-char addresses to 6…4", () => {
    expect(truncateAddress("0x1234567890abcdef1234567890abcdef12345678")).toBe(
      "0x1234…5678",
    );
  });
  it("returns short strings unchanged", () => {
    expect(truncateAddress("0x1234")).toBe("0x1234");
  });
});

describe("truncateHash", () => {
  it("truncates 66-char hashes to 6…4", () => {
    const hash = "0x" + "a".repeat(64);
    expect(truncateHash(hash)).toBe("0xaaaa…aaaa");
  });
});

describe("explorerUrl", () => {
  it("builds a Base Sepolia tx url", () => {
    expect(explorerUrl("tx", "0xabc")).toBe(
      "https://sepolia.basescan.org/tx/0xabc",
    );
  });
  it("builds a Base Sepolia address url", () => {
    expect(explorerUrl("address", "0xabc")).toBe(
      "https://sepolia.basescan.org/address/0xabc",
    );
  });
});
