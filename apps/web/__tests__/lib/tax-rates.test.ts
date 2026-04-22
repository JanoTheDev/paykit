import { describe, it, expect } from "vitest";
import { resolveTax } from "../../lib/tax-rates";

describe("resolveTax", () => {
  it("returns null when country is missing", () => {
    expect(
      resolveTax({ country: null, subtotalCents: 10000 }),
    ).toBeNull();
  });

  it("returns null for unknown country", () => {
    expect(
      resolveTax({ country: "ZZ", subtotalCents: 10000 }),
    ).toBeNull();
  });

  it("resolves DE VAT at 19%", () => {
    const r = resolveTax({ country: "DE", subtotalCents: 10000 });
    expect(r).not.toBeNull();
    expect(r?.rateBps).toBe(1900);
    expect(r?.taxCents).toBe(1900);
    expect(r?.totalCents).toBe(11900);
  });

  it("floors tax math to avoid over-collection", () => {
    // 1 cent * 19% = 0.19 cents → floor to 0
    const r = resolveTax({ country: "DE", subtotalCents: 1 });
    expect(r?.taxCents).toBe(0);
  });

  it("picks US state rate when country is US + state provided", () => {
    const r = resolveTax({ country: "US", state: "CA", subtotalCents: 10000 });
    expect(r?.rateBps).toBe(725);
    expect(r?.taxCents).toBe(725);
  });

  it("returns null for US without state", () => {
    expect(
      resolveTax({ country: "US", subtotalCents: 10000 }),
    ).toBeNull();
  });

  it("returns null for unknown US state", () => {
    expect(
      resolveTax({ country: "US", state: "ZZ", subtotalCents: 10000 }),
    ).toBeNull();
  });

  it("no-tax states return 0 tax but still a resolution", () => {
    const r = resolveTax({ country: "US", state: "OR", subtotalCents: 10000 });
    expect(r?.rateBps).toBe(0);
    expect(r?.taxCents).toBe(0);
    expect(r?.totalCents).toBe(10000);
  });

  it("product override beats the rate table", () => {
    const r = resolveTax({
      country: "DE",
      subtotalCents: 10000,
      productRateBps: 500,
      productLabel: "Flat 5% for this product",
    });
    expect(r?.rateBps).toBe(500);
    expect(r?.taxCents).toBe(500);
    expect(r?.label).toBe("Flat 5% for this product");
  });

  it("reverse charge skips tax entirely", () => {
    const r = resolveTax({
      country: "DE",
      subtotalCents: 10000,
      reverseCharge: true,
    });
    expect(r?.taxCents).toBe(0);
    expect(r?.totalCents).toBe(10000);
    expect(r?.label).toBe("Reverse charge");
  });

  it("subtotal = 0 → null", () => {
    expect(
      resolveTax({ country: "DE", subtotalCents: 0 }),
    ).toBeNull();
  });

  it("case-insensitive country + state", () => {
    const r = resolveTax({
      country: "de",
      subtotalCents: 10000,
    });
    expect(r?.rateBps).toBe(1900);
    const us = resolveTax({
      country: "us",
      state: "ca",
      subtotalCents: 10000,
    });
    expect(us?.rateBps).toBe(725);
  });
});
