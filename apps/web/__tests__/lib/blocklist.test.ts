import { describe, it, expect } from "vitest";
import { findBlocklistMatch } from "../../lib/blocklist";

describe("findBlocklistMatch", () => {
  it("returns null when entries empty", () => {
    expect(
      findBlocklistMatch({
        wallet: "0xAbC",
        email: "a@example.com",
        country: "US",
        entries: [],
      }),
    ).toBeNull();
  });

  it("matches wallet case-insensitively", () => {
    const m = findBlocklistMatch({
      wallet: "0xABCDEF1234",
      entries: [{ type: "wallet", value: "0xabcdef1234" }],
    });
    expect(m?.type).toBe("wallet");
  });

  it("matches country case-insensitively", () => {
    const m = findBlocklistMatch({
      country: "ru",
      entries: [{ type: "country", value: "RU" }],
    });
    expect(m?.type).toBe("country");
  });

  it("matches exact email after gmail normalization", () => {
    const m = findBlocklistMatch({
      email: "A.l.i.c.e+promo@Gmail.com",
      entries: [{ type: "email", value: "alice@gmail.com" }],
    });
    expect(m?.type).toBe("email");
  });

  it("matches domain-only entry for any address on that domain", () => {
    const m = findBlocklistMatch({
      email: "anyone@spam.com",
      entries: [{ type: "email", value: "spam.com" }],
    });
    expect(m?.type).toBe("email");
  });

  it("does not match a different domain", () => {
    expect(
      findBlocklistMatch({
        email: "anyone@good.com",
        entries: [{ type: "email", value: "spam.com" }],
      }),
    ).toBeNull();
  });

  it("does not mix types", () => {
    expect(
      findBlocklistMatch({
        wallet: "0x1",
        entries: [{ type: "email", value: "0x1" }],
      }),
    ).toBeNull();
  });

  it("returns first match among multiple entries", () => {
    const m = findBlocklistMatch({
      wallet: "0xabc",
      country: "RU",
      entries: [
        { type: "country", value: "RU" },
        { type: "wallet", value: "0xabc" },
      ],
    });
    expect(m?.type).toBe("country");
  });
});
