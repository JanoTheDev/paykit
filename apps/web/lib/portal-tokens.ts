import { createHmac, timingSafeEqual } from "crypto";

function getSecret(): string {
  return process.env.BETTER_AUTH_SECRET || "paylix-portal-fallback-secret";
}

export function signPortalToken(customerId: string): string {
  const exp = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const payload = `${customerId}.${exp}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifyPortalToken(token: string, customerId: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const parts = decoded.split(".");
    if (parts.length !== 3) return false;
    const [tokenCustomerId, expStr, sig] = parts;
    if (tokenCustomerId !== customerId) return false;
    const exp = parseInt(expStr, 10);
    if (!Number.isFinite(exp) || Date.now() > exp) return false;
    const expected = createHmac("sha256", getSecret())
      .update(`${tokenCustomerId}.${expStr}`)
      .digest("hex");
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(sig, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
