import { describe, it, expect, vi } from "vitest";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { startListener } from "../listener";
import { startKeeper } from "../keeper";

const FAKE_PROGRAM_ID = new PublicKey("11111111111111111111111111111111");

describe("solana-indexer listener", () => {
  it("registers onLogs for every program id and unregisters on stop", async () => {
    const onLogs = vi.fn(() => 42);
    const removeOnLogsListener = vi.fn(async () => true);
    const fakeConn = { onLogs, removeOnLogsListener } as unknown as Connection;

    const handle = await startListener({
      connection: fakeConn,
      programIds: [FAKE_PROGRAM_ID, FAKE_PROGRAM_ID],
      onEvent: async () => {},
    });
    expect(onLogs).toHaveBeenCalledTimes(2);

    await handle.stop();
    expect(removeOnLogsListener).toHaveBeenCalledTimes(2);
  });

  it("dispatches decoded Program data log lines to onEvent", async () => {
    const { sha256 } = await import("@noble/hashes/sha2.js");
    // Build a valid SubscriptionCancelled payload (shortest event).
    const disc = Buffer.from(sha256(new TextEncoder().encode("event:SubscriptionCancelled"))).subarray(0, 8);
    const id = Buffer.alloc(8);
    id.writeBigUInt64LE(7n);
    const payload = Buffer.concat([disc, id]).toString("base64");

    let captured: unknown;
    const subs: ((l: { err: null; logs: string[]; signature: string }, c: { slot: number }) => void)[] = [];
    const fakeConn = {
      onLogs: (_pid: PublicKey, cb: (l: { err: null; logs: string[]; signature: string }, c: { slot: number }) => void) => {
        subs.push(cb);
        return 0;
      },
      removeOnLogsListener: async () => true,
    } as unknown as Connection;

    const h = await startListener({
      connection: fakeConn,
      programIds: [FAKE_PROGRAM_ID],
      onEvent: async (ev) => { captured = ev; },
    });
    subs[0]!(
      { err: null, logs: [`Program data: ${payload}`], signature: "SIG" },
      { slot: 100 },
    );
    await new Promise((r) => setTimeout(r, 10));
    expect(captured).toMatchObject({ signature: "SIG", slot: 100 });
    // Narrowing: event.kind should be SubscriptionCancelled, id 7.
    const ev = captured as { event: { kind: string; subscriptionId: bigint } };
    expect(ev.event.kind).toBe("SubscriptionCancelled");
    expect(ev.event.subscriptionId).toBe(7n);
    await h.stop();
  });
});

describe("solana-indexer keeper", () => {
  it("tick returns 0 when skeleton (no keypair / no due hook)", async () => {
    const conn = new Connection("http://127.0.0.1:8899");
    const h = await startKeeper({ connection: conn, intervalMs: 60_000 });
    expect(await h.tick()).toBe(0);
    await h.stop();
  });

  it("tick invokes due-subscriptions when fully configured", async () => {
    const conn = {
      getLatestBlockhash: vi.fn(async () => ({ blockhash: "x".repeat(43), lastValidBlockHeight: 1 })),
      sendTransaction: vi.fn(async () => "sig"),
    } as unknown as Connection;
    const keeper = Keypair.generate();
    const dueSpy = vi.fn(async () => []);
    const h = await startKeeper({
      connection: conn,
      keeper,
      subscriptionManagerProgramId: FAKE_PROGRAM_ID,
      dueSubscriptions: dueSpy,
      intervalMs: 3_600_000,
    });
    await h.tick();
    expect(dueSpy).toHaveBeenCalledTimes(1);
    await h.stop();
  });
});
