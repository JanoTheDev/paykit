import { describe, it, expect } from "vitest";
import { computePauseUpdate, computeResumeUpdate } from "../pause/logic";

describe("computePauseUpdate", () => {
  it("returns paused fields when sub is active", () => {
    const now = new Date("2026-04-12T10:00:00Z");
    const result = computePauseUpdate({ status: "active", pausedBy: null }, "merchant", now);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.update.status).toBe("paused");
      expect(result.update.pausedAt).toEqual(now);
    }
  });

  it("rejects pausing a trialing sub", () => {
    const result = computePauseUpdate({ status: "trialing", pausedBy: null }, "merchant", new Date());
    expect(result.ok).toBe(false);
  });

  it("rejects pausing a cancelled sub", () => {
    const result = computePauseUpdate({ status: "cancelled", pausedBy: null }, "merchant", new Date());
    expect(result.ok).toBe(false);
  });

  it("records pausedBy when merchant pauses", () => {
    const now = new Date("2026-04-12T10:00:00Z");
    const result = computePauseUpdate({ status: "active", pausedBy: null }, "merchant", now);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.update.pausedBy).toBe("merchant");
    }
  });

  it("records pausedBy when customer pauses", () => {
    const now = new Date("2026-04-12T10:00:00Z");
    const result = computePauseUpdate({ status: "active", pausedBy: null }, "customer", now);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.update.pausedBy).toBe("customer");
    }
  });
});

describe("computeResumeUpdate", () => {
  it("shifts nextChargeDate forward by paused duration", () => {
    const pausedAt = new Date("2026-04-12T00:00:00Z");
    const nextChargeDate = new Date("2026-04-15T00:00:00Z");
    const now = new Date("2026-04-13T00:00:00Z"); // 1 day paused
    const result = computeResumeUpdate(
      { status: "paused", pausedAt, pausedBy: null, nextChargeDate },
      "merchant",
      now,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.update.status).toBe("active");
      expect(result.update.pausedAt).toBeNull();
      expect(result.update.nextChargeDate).toEqual(new Date("2026-04-16T00:00:00Z"));
    }
  });

  it("rejects resuming a non-paused sub", () => {
    const result = computeResumeUpdate(
      { status: "active", pausedAt: null, pausedBy: null, nextChargeDate: new Date() },
      "merchant",
      new Date(),
    );
    expect(result.ok).toBe(false);
  });

  it("allows merchant to resume a merchant-paused sub", () => {
    const pausedAt = new Date("2026-04-12T00:00:00Z");
    const result = computeResumeUpdate(
      { status: "paused", pausedAt, pausedBy: "merchant", nextChargeDate: new Date("2026-04-15T00:00:00Z") },
      "merchant",
      new Date("2026-04-13T00:00:00Z"),
    );
    expect(result.ok).toBe(true);
  });

  it("rejects merchant resuming a customer-paused sub", () => {
    const result = computeResumeUpdate(
      {
        status: "paused",
        pausedAt: new Date("2026-04-12T00:00:00Z"),
        pausedBy: "customer",
        nextChargeDate: new Date("2026-04-15T00:00:00Z"),
      },
      "merchant",
      new Date("2026-04-13T00:00:00Z"),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("paused_by_other_party");
    }
  });

  it("rejects customer resuming a merchant-paused sub", () => {
    const result = computeResumeUpdate(
      {
        status: "paused",
        pausedAt: new Date("2026-04-12T00:00:00Z"),
        pausedBy: "merchant",
        nextChargeDate: new Date("2026-04-15T00:00:00Z"),
      },
      "customer",
      new Date("2026-04-13T00:00:00Z"),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("paused_by_other_party");
    }
  });
});
