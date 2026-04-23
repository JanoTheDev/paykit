import { describe, it, expect } from "vitest";
import { sha256 } from "@noble/hashes/sha2.js";
import { decodeProgramData } from "../decoder";

function disc(name: string): Buffer {
  return Buffer.from(sha256(new TextEncoder().encode(`event:${name}`))).subarray(0, 8);
}

function pubkeyOne(byte: number): Buffer {
  const b = Buffer.alloc(32, byte);
  return b;
}

function u64LE(v: bigint): Buffer {
  const b = Buffer.alloc(8);
  b.writeBigUInt64LE(v);
  return b;
}

function i64LE(v: bigint): Buffer {
  const b = Buffer.alloc(8);
  b.writeBigInt64LE(v);
  return b;
}

describe("decodeProgramData", () => {
  it("decodes PaymentReceived", () => {
    const payload = Buffer.concat([
      disc("PaymentReceived"),
      pubkeyOne(0x01), // buyer
      pubkeyOne(0x02), // merchant
      pubkeyOne(0x03), // mint
      u64LE(100_000_000n), // amount
      u64LE(500_000n), // fee
      Buffer.alloc(32, 0xaa), // productId
      Buffer.alloc(32, 0xbb), // customerId
    ]);
    const ev = decodeProgramData(payload.toString("base64"));
    expect(ev?.kind).toBe("PaymentReceived");
    if (ev?.kind !== "PaymentReceived") throw new Error("type narrow");
    expect(ev.amount).toBe(100_000_000n);
    expect(ev.fee).toBe(500_000n);
    expect(ev.productId).toBe("0x" + "aa".repeat(32));
    expect(ev.customerId).toBe("0x" + "bb".repeat(32));
  });

  it("decodes SubscriptionCreated", () => {
    const payload = Buffer.concat([
      disc("SubscriptionCreated"),
      u64LE(42n), // subscriptionId
      pubkeyOne(0x04), // subscriber
      pubkeyOne(0x05), // merchantAta
      pubkeyOne(0x06), // mint
      u64LE(10_000_000n), // amount
      i64LE(2_592_000n), // intervalSeconds (30d)
      Buffer.alloc(32, 0x11),
      Buffer.alloc(32, 0x22),
    ]);
    const ev = decodeProgramData(payload.toString("base64"));
    expect(ev?.kind).toBe("SubscriptionCreated");
    if (ev?.kind !== "SubscriptionCreated") throw new Error("type narrow");
    expect(ev.subscriptionId).toBe(42n);
    expect(ev.intervalSeconds).toBe(2_592_000n);
  });

  it("decodes SubscriptionCharged", () => {
    const payload = Buffer.concat([
      disc("SubscriptionCharged"),
      u64LE(42n),
      pubkeyOne(0x07),
      pubkeyOne(0x08),
      pubkeyOne(0x09),
      u64LE(10_000_000n),
    ]);
    const ev = decodeProgramData(payload.toString("base64"));
    expect(ev?.kind).toBe("SubscriptionCharged");
    if (ev?.kind !== "SubscriptionCharged") throw new Error("type narrow");
    expect(ev.subscriptionId).toBe(42n);
    expect(ev.amount).toBe(10_000_000n);
  });

  it("decodes SubscriptionCancelled", () => {
    const payload = Buffer.concat([
      disc("SubscriptionCancelled"),
      u64LE(42n),
    ]);
    const ev = decodeProgramData(payload.toString("base64"));
    expect(ev?.kind).toBe("SubscriptionCancelled");
    if (ev?.kind !== "SubscriptionCancelled") throw new Error("type narrow");
    expect(ev.subscriptionId).toBe(42n);
  });

  it("returns null on unknown discriminator", () => {
    const bogus = Buffer.concat([Buffer.alloc(8, 0xff), Buffer.alloc(16, 0)]);
    expect(decodeProgramData(bogus.toString("base64"))).toBeNull();
  });

  it("returns null on malformed input", () => {
    expect(decodeProgramData("not-base64@@@")).toBeNull();
    expect(decodeProgramData("")).toBeNull();
  });
});
