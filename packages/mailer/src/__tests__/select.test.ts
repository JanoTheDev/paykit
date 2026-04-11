import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { selectDriver } from "../select";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
  delete process.env.MAIL_DRIVER;
  delete process.env.RESEND_API_KEY;
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_PORT;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASS;
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
});

describe("selectDriver", () => {
  it("returns a noop driver when MAIL_DRIVER is unset", async () => {
    const driver = await selectDriver();
    const result = await driver.send({
      to: "a@b.com",
      from: "f@x.com",
      subject: "s",
      react: null as never,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/MAIL_DRIVER/);
  });

  it("selects resend when MAIL_DRIVER=resend", async () => {
    process.env.MAIL_DRIVER = "resend";
    process.env.RESEND_API_KEY = "test";
    const driver = await selectDriver();
    expect(typeof driver.send).toBe("function");
  });

  it("selects smtp when MAIL_DRIVER=smtp", async () => {
    process.env.MAIL_DRIVER = "smtp";
    process.env.SMTP_HOST = "h";
    process.env.SMTP_PORT = "587";
    process.env.SMTP_USER = "u";
    process.env.SMTP_PASS = "p";
    const driver = await selectDriver();
    expect(typeof driver.send).toBe("function");
  });

  it("throws on invalid MAIL_DRIVER", async () => {
    process.env.MAIL_DRIVER = "pigeon";
    await expect(selectDriver()).rejects.toThrow(/MAIL_DRIVER/);
  });
});
