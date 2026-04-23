/**
 * Solana indexer — skeleton. Issue #57.
 *
 * Mirrors the EVM indexer's job mix: a log listener that watches the
 * Anchor program IDs for PaymentReceived / SubscriptionCreated /
 * SubscriptionPaymentReceived events, plus a keeper loop that charges due
 * subscriptions via the SubscriptionManager program's CPI path.
 *
 * Runs as a separate Node process from the EVM indexer — no shared state
 * besides the Postgres tables keyed by `network_key = 'solana' |
 * 'solana-devnet'`.
 *
 * This file wires imports + outlines the service loop. Full listener /
 * keeper implementations land in the #57 follow-up PR.
 */

import { Connection } from "@solana/web3.js";
import { startListener } from "./listener";
import { startKeeper } from "./keeper";

async function main() {
  const rpcUrl = process.env.SOLANA_RPC_URL;
  if (!rpcUrl) {
    throw new Error(
      "SOLANA_RPC_URL is required. Use your own QuickNode / Helius endpoint for production — the public devnet endpoint has aggressive rate limits.",
    );
  }
  const connection = new Connection(rpcUrl, "finalized");

  const listenerHandle = await startListener({ connection });
  const keeperHandle = await startKeeper({ connection });

  process.on("SIGINT", async () => {
    await listenerHandle.stop();
    await keeperHandle.stop();
    process.exit(0);
  });
}

if (process.env.NODE_ENV !== "test") {
  void main().catch((err) => {
    console.error("[solana-indexer] fatal:", err);
    process.exit(1);
  });
}
