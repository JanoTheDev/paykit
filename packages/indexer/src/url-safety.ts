import { lookup } from "dns/promises";

const BLOCKED_CIDRS = [
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^::1$/,
  /^fe80::/i,
  /^fc00::/i,
  /^fd00::/i,
];

function isBlockedIp(ip: string): boolean {
  return BLOCKED_CIDRS.some((re) => re.test(ip));
}

export async function validateWebhookUrl(url: string): Promise<string | null> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "Invalid URL";
  }

  if (parsed.protocol !== "https:" && process.env.NODE_ENV === "production") {
    return "HTTPS required";
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return "Only http/https allowed";
  }

  const hostname = parsed.hostname.toLowerCase();
  if (hostname === "localhost") return "localhost not allowed";

  try {
    const { address } = await lookup(hostname);
    if (isBlockedIp(address)) {
      return "Private/internal IPs not allowed";
    }
  } catch {
    return "Could not resolve hostname";
  }

  return null;
}
