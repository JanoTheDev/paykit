import { describe, it, expect } from "vitest";
import {
  hashRequestBody,
  evaluateSentinel,
  STALE_SENTINEL_MS,
} from "./idempotency";

describe("hashRequestBody", () => {
  it("is deterministic for identical bodies", () => {
    expect(hashRequestBody('{"a":1}')).toBe(hashRequestBody('{"a":1}'));
  });
  it("differs for different bodies", () => {
    expect(hashRequestBody('{"a":1}')).not.toBe(hashRequestBody('{"a":2}'));
  });
  it("produces a 64-char hex string", () => {
    expect(hashRequestBody("hello")).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("evaluateSentinel", () => {
  const now = new Date("2026-04-12T12:00:00Z");
  const hash = "abcdef";

  it("returns 'miss' when no row exists", () => {
    const result = evaluateSentinel({ existing: null, requestHash: hash, now });
    expect(result.kind).toBe("miss");
  });

  it("returns 'hit' when row is completed with matching hash", () => {
    const result = evaluateSentinel({
      existing: {
        requestHash: hash,
        responseStatus: 200,
        responseBody: { ok: true },
        completedAt: new Date("2026-04-12T11:59:58Z"),
        createdAt: new Date("2026-04-12T11:59:55Z"),
      },
      requestHash: hash,
      now,
    });
    expect(result.kind).toBe("hit");
    if (result.kind === "hit") {
      expect(result.responseStatus).toBe(200);
      expect(result.responseBody).toEqual({ ok: true });
    }
  });

  it("returns 'processing' when row exists but completedAt is null and is fresh", () => {
    const result = evaluateSentinel({
      existing: {
        requestHash: hash,
        responseStatus: null,
        responseBody: null,
        completedAt: null,
        createdAt: new Date(now.getTime() - 2_000),
      },
      requestHash: hash,
      now,
    });
    expect(result.kind).toBe("processing");
  });

  it("returns 'stale' when sentinel is older than STALE_SENTINEL_MS", () => {
    const result = evaluateSentinel({
      existing: {
        requestHash: hash,
        responseStatus: null,
        responseBody: null,
        completedAt: null,
        createdAt: new Date(now.getTime() - (STALE_SENTINEL_MS + 1_000)),
      },
      requestHash: hash,
      now,
    });
    expect(result.kind).toBe("stale");
  });

  it("returns 'conflict' on request-hash mismatch regardless of completion state", () => {
    const completed = evaluateSentinel({
      existing: {
        requestHash: "different",
        responseStatus: 200,
        responseBody: {},
        completedAt: new Date(now.getTime() - 5_000),
        createdAt: new Date(now.getTime() - 10_000),
      },
      requestHash: hash,
      now,
    });
    expect(completed.kind).toBe("conflict");

    const processing = evaluateSentinel({
      existing: {
        requestHash: "different",
        responseStatus: null,
        responseBody: null,
        completedAt: null,
        createdAt: new Date(now.getTime() - 2_000),
      },
      requestHash: hash,
      now,
    });
    expect(processing.kind).toBe("conflict");
  });
});
