import type { Connection } from "@solana/web3.js";

export interface KeeperHandle {
  stop(): Promise<void>;
}

/**
 * Keeper loop — selects due subscriptions with network_key='solana*', builds
 * a charge_subscription transaction signed by the keeper keypair, and
 * submits it. Mirrors the EVM keeper but over @solana/web3.js.
 *
 * Implementation pending — issue #57.
 */
export async function startKeeper(_opts: { connection: Connection }): Promise<KeeperHandle> {
  console.log("[solana-keeper] started (skeleton — no-op until #57 implementation lands)");
  return {
    async stop() {
      // no-op
    },
  };
}
