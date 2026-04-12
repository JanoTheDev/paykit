import { describe, it, expect } from "vitest";
import { normalizeEmail, isDisposableEmail } from "../email-normalize";

describe("normalizeEmail", () => {
  it("lowercases the whole address", () => {
    expect(normalizeEmail("Alice@Example.COM")).toBe("alice@example.com");
  });

  it("strips dots from gmail local part", () => {
    expect(normalizeEmail("alice.smith@gmail.com")).toBe("alicesmith@gmail.com");
    expect(normalizeEmail("a.l.i.c.e@gmail.com")).toBe("alice@gmail.com");
  });

  it("drops gmail +tag", () => {
    expect(normalizeEmail("alice+trial@gmail.com")).toBe("alice@gmail.com");
    expect(normalizeEmail("alice.smith+abuse@gmail.com")).toBe("alicesmith@gmail.com");
  });

  it("treats googlemail.com the same as gmail.com", () => {
    expect(normalizeEmail("alice.smith+x@googlemail.com")).toBe("alicesmith@gmail.com");
  });

  it("leaves other providers' dots and plus alone", () => {
    expect(normalizeEmail("alice.smith+x@example.com")).toBe("alice.smith+x@example.com");
    expect(normalizeEmail("alice+x@protonmail.com")).toBe("alice+x@protonmail.com");
  });

  it("handles trimming and weird input", () => {
    expect(normalizeEmail("  ALICE@gmail.com  ")).toBe("alice@gmail.com");
    expect(normalizeEmail("not-an-email")).toBe("not-an-email");
    expect(normalizeEmail("@nodomain")).toBe("@nodomain");
  });
});

describe("isDisposableEmail", () => {
  it("flags known disposable domains", () => {
    expect(isDisposableEmail("foo@mailinator.com")).toBe(true);
    expect(isDisposableEmail("foo@guerrillamail.com")).toBe(true);
    expect(isDisposableEmail("foo@10minutemail.com")).toBe(true);
    expect(isDisposableEmail("foo@yopmail.com")).toBe(true);
  });

  it("does not flag legit providers", () => {
    expect(isDisposableEmail("foo@gmail.com")).toBe(false);
    expect(isDisposableEmail("foo@protonmail.com")).toBe(false);
    expect(isDisposableEmail("foo@example.com")).toBe(false);
  });

  it("is case insensitive on domain", () => {
    expect(isDisposableEmail("foo@MAILINATOR.com")).toBe(true);
  });

  it("returns false for invalid input", () => {
    expect(isDisposableEmail("not-an-email")).toBe(false);
    expect(isDisposableEmail("")).toBe(false);
  });
});
