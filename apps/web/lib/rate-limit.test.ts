import { describe, it, expect, beforeEach } from "vitest";
import {
  checkRateLimit,
  resetRateLimit,
  __clearAllBuckets,
} from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    __clearAllBuckets();
  });

  it("allows requests under the limit", () => {
    const r1 = checkRateLimit("ip:1", 3, 60_000, 1000);
    const r2 = checkRateLimit("ip:1", 3, 60_000, 1001);
    const r3 = checkRateLimit("ip:1", 3, 60_000, 1002);
    expect(r1.ok).toBe(true);
    expect(r2.ok).toBe(true);
    expect(r3.ok).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("rejects requests over the limit", () => {
    checkRateLimit("ip:2", 2, 60_000, 1000);
    checkRateLimit("ip:2", 2, 60_000, 1001);
    const r3 = checkRateLimit("ip:2", 2, 60_000, 1002);
    expect(r3.ok).toBe(false);
    expect(r3.retryAfterMs).toBeGreaterThan(0);
  });

  it("resets after the window elapses", () => {
    checkRateLimit("ip:3", 1, 1000, 1000);
    const rReject = checkRateLimit("ip:3", 1, 1000, 1500);
    expect(rReject.ok).toBe(false);
    const rAccept = checkRateLimit("ip:3", 1, 1000, 2001);
    expect(rAccept.ok).toBe(true);
  });

  it("keys are independent", () => {
    checkRateLimit("ip:4a", 1, 60_000, 1000);
    const rB = checkRateLimit("ip:4b", 1, 60_000, 1001);
    expect(rB.ok).toBe(true);
  });

  it("retryAfterMs reflects remaining window", () => {
    checkRateLimit("ip:5", 1, 10_000, 1000);
    const r = checkRateLimit("ip:5", 1, 10_000, 3000);
    expect(r.ok).toBe(false);
    expect(r.retryAfterMs).toBe(8000);
  });
});

describe("resetRateLimit", () => {
  beforeEach(() => {
    __clearAllBuckets();
  });

  it("clears a key's bucket", () => {
    checkRateLimit("ip:6", 1, 60_000, 1000);
    const rBefore = checkRateLimit("ip:6", 1, 60_000, 1001);
    expect(rBefore.ok).toBe(false);

    resetRateLimit("ip:6");

    const rAfter = checkRateLimit("ip:6", 1, 60_000, 1002);
    expect(rAfter.ok).toBe(true);
  });
});
