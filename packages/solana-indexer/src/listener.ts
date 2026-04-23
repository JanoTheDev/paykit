import type { Connection } from "@solana/web3.js";

export interface ListenerHandle {
  stop(): Promise<void>;
}

/**
 * Subscribe to the Paylix program logs and route them to the EVM-indexer-
 * compatible event handlers. Uses `connection.onLogs(programId, ...)` with a
 * finalized commitment — never `processed`, per the reorg-safety invariant
 * mirrored from the EVM indexer.
 *
 * Implementation pending — issue #57.
 */
export async function startListener(_opts: { connection: Connection }): Promise<ListenerHandle> {
  console.log("[solana-listener] started (skeleton — no-op until #57 implementation lands)");
  return {
    async stop() {
      // no-op
    },
  };
}
