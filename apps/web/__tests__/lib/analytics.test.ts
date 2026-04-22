import { describe, it, expect } from "vitest";
import {
  daysBetween,
  formatDay,
  aggregateRevenueByDay,
  aggregateFailedRateByDay,
  aggregateMrrByDay,
  aggregateActiveSubsByDay,
  monthlyCents,
  arpuCents,
} from "../../lib/analytics";

const from = new Date("2026-04-01T00:00:00Z");
const to = new Date("2026-04-03T00:00:00Z");

describe("daysBetween", () => {
  it("inclusive at both ends", () => {
    expect(daysBetween(from, to)).toEqual(["2026-04-01", "2026-04-02", "2026-04-03"]);
  });

  it("formatDay respects UTC", () => {
    expect(formatDay(new Date("2026-04-02T23:59:59Z"))).toBe("2026-04-02");
  });
});

describe("aggregateRevenueByDay", () => {
  it("buckets confirmed payments per day and zero-fills missing days", () => {
    const rows = [
      { amount: 1000, status: "confirmed" as const, createdAt: new Date("2026-04-01T10:00:00Z") },
      { amount: 500, status: "confirmed" as const, createdAt: new Date("2026-04-01T14:00:00Z") },
      { amount: 200, status: "failed" as const, createdAt: new Date("2026-04-02T10:00:00Z") },
      { amount: 2500, status: "confirmed" as const, createdAt: new Date("2026-04-03T10:00:00Z") },
    ];
    expect(aggregateRevenueByDay(rows, from, to)).toEqual([
      { date: "2026-04-01", value: 1500 },
      { date: "2026-04-02", value: 0 },
      { date: "2026-04-03", value: 2500 },
    ]);
  });

  it("ignores rows outside the window", () => {
    const rows = [
      { amount: 9999, status: "confirmed" as const, createdAt: new Date("2026-03-28T10:00:00Z") },
    ];
    expect(aggregateRevenueByDay(rows, from, to).every((b) => b.value === 0)).toBe(true);
  });
});

describe("aggregateFailedRateByDay", () => {
  it("computes failed / attempted ignoring pending", () => {
    const rows = [
      { amount: 100, status: "confirmed" as const, createdAt: new Date("2026-04-01T10:00:00Z") },
      { amount: 100, status: "failed" as const, createdAt: new Date("2026-04-01T11:00:00Z") },
      { amount: 100, status: "pending" as const, createdAt: new Date("2026-04-01T12:00:00Z") },
    ];
    const out = aggregateFailedRateByDay(rows, from, to);
    expect(out[0]).toEqual({
      date: "2026-04-01",
      value: { rate: 0.5, failed: 1, attempted: 2 },
    });
  });

  it("zero attempts → zero rate (no div by zero)", () => {
    const out = aggregateFailedRateByDay([], from, to);
    for (const b of out) expect(b.value.rate).toBe(0);
  });
});

describe("monthlyCents", () => {
  it("monthly interval returns amount unchanged", () => {
    expect(monthlyCents({ amountCents: 1000, intervalSeconds: 30 * 24 * 60 * 60 })).toBe(1000);
  });

  it("weekly interval returns ~4.28x", () => {
    const v = monthlyCents({ amountCents: 1000, intervalSeconds: 7 * 24 * 60 * 60 });
    expect(v).toBe(Math.floor((1000 * 30) / 7));
  });

  it("missing interval returns zero", () => {
    expect(monthlyCents({ amountCents: 500, intervalSeconds: null })).toBe(0);
  });
});

describe("aggregateMrrByDay", () => {
  const monthSec = 30 * 24 * 60 * 60;

  it("counts active sub on day created onward, excluding cancelled days", () => {
    const rows = [
      {
        status: "active" as const,
        intervalSeconds: monthSec,
        amountCents: 1000,
        createdAt: new Date("2026-04-02T00:00:00Z"),
        cancelledAt: null,
      },
    ];
    expect(aggregateMrrByDay(rows, from, to)).toEqual([
      { date: "2026-04-01", value: 0 },
      { date: "2026-04-02", value: 1000 },
      { date: "2026-04-03", value: 1000 },
    ]);
  });

  it("includes cancelled subs only on days before cancellation", () => {
    const rows = [
      {
        status: "cancelled" as const,
        intervalSeconds: monthSec,
        amountCents: 1000,
        createdAt: new Date("2026-04-01T00:00:00Z"),
        cancelledAt: new Date("2026-04-02T12:00:00Z"),
      },
    ];
    expect(aggregateMrrByDay(rows, from, to)).toEqual([
      { date: "2026-04-01", value: 1000 },
      { date: "2026-04-02", value: 0 },
      { date: "2026-04-03", value: 0 },
    ]);
  });

  it("ignores trialing subs", () => {
    const rows = [
      {
        status: "trialing" as const,
        intervalSeconds: monthSec,
        amountCents: 1000,
        createdAt: new Date("2026-04-01T00:00:00Z"),
        cancelledAt: null,
      },
    ];
    expect(aggregateMrrByDay(rows, from, to).every((b) => b.value === 0)).toBe(true);
  });
});

describe("aggregateActiveSubsByDay", () => {
  it("counts active+past_due", () => {
    const rows = [
      {
        status: "active" as const,
        intervalSeconds: 2_592_000,
        amountCents: 100,
        createdAt: new Date("2026-04-01T00:00:00Z"),
        cancelledAt: null,
      },
      {
        status: "past_due" as const,
        intervalSeconds: 2_592_000,
        amountCents: 100,
        createdAt: new Date("2026-04-02T00:00:00Z"),
        cancelledAt: null,
      },
      {
        status: "trialing" as const,
        intervalSeconds: 2_592_000,
        amountCents: 100,
        createdAt: new Date("2026-04-01T00:00:00Z"),
        cancelledAt: null,
      },
    ];
    expect(aggregateActiveSubsByDay(rows, from, to)).toEqual([
      { date: "2026-04-01", value: 1 },
      { date: "2026-04-02", value: 2 },
      { date: "2026-04-03", value: 2 },
    ]);
  });
});

describe("arpuCents", () => {
  it("revenue / distinct paying customers", () => {
    const payments = [
      { amount: 1000, status: "confirmed" as const, customerId: "c1" },
      { amount: 500, status: "confirmed" as const, customerId: "c1" },
      { amount: 2500, status: "confirmed" as const, customerId: "c2" },
      { amount: 300, status: "failed" as const, customerId: "c3" },
    ];
    // (1000 + 500 + 2500) / 2 = 2000
    expect(arpuCents(payments)).toBe(2000);
  });

  it("empty → zero", () => {
    expect(arpuCents([])).toBe(0);
  });
});
