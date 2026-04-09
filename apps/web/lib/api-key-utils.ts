import { randomBytes, createHash } from "crypto";

export function generateApiKey(type: "publishable" | "secret", network: "live" | "test"): {
  key: string;
  prefix: string;
  hash: string;
} {
  const prefixMap = {
    publishable: { live: "pk_live_", test: "pk_test_" },
    secret: { live: "sk_live_", test: "sk_test_" },
  };
  const prefix = prefixMap[type][network];
  const random = randomBytes(24).toString("base64url");
  const key = `${prefix}${random}`;
  const hash = createHash("sha256").update(key).digest("hex");
  return { key, prefix: key.slice(0, 12), hash };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}
