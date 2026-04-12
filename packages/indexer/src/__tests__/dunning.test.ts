import { describe, it, expect } from "vitest";
import { computeNextRetryAt, classifyDunningOutcome, RETRY_SCHEDULE_HOURS, MAX_PAST_DUE_DAYS } from "../dunning";

describe("computeNextRetryAt", () => {
  const now = new Date("2026-04-12T00:00:00Z");

  it("first failure schedules retry 24 hours later", () => {
    const next = computeNextRetryAt(1, now);
    expect(next.getTime() - now.getTime()).toBe(24 * 60 * 60 * 1000);
  });

  it("second failure schedules retry 72 hours later", () => {
    const next = computeNextRetryAt(2, now);
    expect(next.getTime() - now.getTime()).toBe(72 * 60 * 60 * 1000);
  });

  it("third failure schedules retry 168 hours later", () => {
    const next = computeNextRetryAt(3, now);
    expect(next.getTime() - now.getTime()).toBe(168 * 60 * 60 * 1000);
  });

  it("schedule constants are exported and ordered", () => {
    expect(RETRY_SCHEDULE_HOURS).toEqual([24, 72, 168]);
  });
});

describe("classifyDunningOutcome", () => {
  it("first failure → retry", () => {
    expect(classifyDunningOutcome({ failureCount: 1, hoursPastDue: 0 })).toBe("retry");
  });

  it("third failure → retry", () => {
    expect(classifyDunningOutcome({ failureCount: 3, hoursPastDue: 0 })).toBe("retry");
  });

  it("fourth failure → past_due", () => {
    expect(classifyDunningOutcome({ failureCount: 4, hoursPastDue: 0 })).toBe("past_due");
  });

  it("past_due longer than MAX_PAST_DUE_DAYS → cancel", () => {
    expect(classifyDunningOutcome({ failureCount: 4, hoursPastDue: MAX_PAST_DUE_DAYS * 24 + 1 })).toBe("cancel");
  });
});
