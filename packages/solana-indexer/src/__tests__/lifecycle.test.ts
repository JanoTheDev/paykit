import { describe, it, expect } from "vitest";
import { Connection } from "@solana/web3.js";
import { startListener } from "../listener";
import { startKeeper } from "../keeper";

/**
 * Skeleton smoke tests. The listener and keeper are no-ops until issue #57
 * wires the real implementations. These tests lock in the handle shape so
 * the implementation PR can't silently break the public contract.
 */
describe("solana-indexer skeletons", () => {
  const connection = new Connection("http://127.0.0.1:8899");

  it("startListener returns a handle with an async stop()", async () => {
    const h = await startListener({ connection });
    expect(typeof h.stop).toBe("function");
    await expect(h.stop()).resolves.toBeUndefined();
  });

  it("startKeeper returns a handle with an async stop()", async () => {
    const h = await startKeeper({ connection });
    expect(typeof h.stop).toBe("function");
    await expect(h.stop()).resolves.toBeUndefined();
  });

  it("multiple listeners can coexist (skeleton allows parallel subs)", async () => {
    const a = await startListener({ connection });
    const b = await startListener({ connection });
    await a.stop();
    await b.stop();
  });
});
