import { describe, it, expect } from "vitest";
import { generateApiKey, hashApiKey } from "../../lib/api-key-utils";

describe("generateApiKey", () => {
  it("generates publishable live key with pk_live_ prefix", () => {
    const { key, prefix, hash } = generateApiKey("publishable", "live");
    expect(key).toMatch(/^pk_live_/);
    expect(prefix).toBe(key.slice(0, 12));
    expect(hash).toHaveLength(64);
  });

  it("generates secret test key with sk_test_ prefix", () => {
    const { key } = generateApiKey("secret", "test");
    expect(key).toMatch(/^sk_test_/);
  });

  it("generates unique keys each time", () => {
    const a = generateApiKey("publishable", "test");
    const b = generateApiKey("publishable", "test");
    expect(a.key).not.toBe(b.key);
    expect(a.hash).not.toBe(b.hash);
  });
});

describe("hashApiKey", () => {
  it("produces consistent hash for same input", () => {
    const hash1 = hashApiKey("pk_test_abc123");
    const hash2 = hashApiKey("pk_test_abc123");
    expect(hash1).toBe(hash2);
  });

  it("produces different hash for different input", () => {
    const hash1 = hashApiKey("pk_test_abc123");
    const hash2 = hashApiKey("pk_test_xyz789");
    expect(hash1).not.toBe(hash2);
  });

  it("returns 64-char hex string", () => {
    const hash = hashApiKey("sk_live_test");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
