/**
 * High-level UTXO watcher service. Consumes a list of active checkout
 * sessions (from @paylix/db), subscribes to their derived addresses via
 * Electrum, and emits payment events back to the indexer so a payment row
 * is created and the webhook fires.
 *
 * Runtime model mirrors the EVM indexer: single long-running Node process
 * that shares the same Postgres tables, keyed by `network_key = 'bitcoin'`
 * or `'litecoin'` (or the testnet variants). Runs alongside — not as a
 * replacement for — the EVM indexer.
 */

import type { UtxoChainDescriptor } from "./descriptors";
import type { AddressPaymentHit, ElectrumClient } from "./electrum";

export interface WatcherSession {
  sessionId: string;
  address: string;
  expectedSats: bigint;
  expiresAt: Date;
}

export interface WatcherCallbacks {
  /** Fired on every scanned transaction that credits a watched address. */
  onPayment(session: WatcherSession, hit: AddressPaymentHit): Promise<void>;
  /** Fired when a session reaches expiresAt without a matching tx. */
  onExpire(session: WatcherSession): Promise<void>;
}

export interface WatcherOptions {
  descriptor: UtxoChainDescriptor;
  client: ElectrumClient;
  confirmations?: number;
  callbacks: WatcherCallbacks;
}

export interface WatcherHandle {
  watch(session: WatcherSession): Promise<void>;
  unwatch(sessionId: string): Promise<void>;
  stop(): Promise<void>;
}

/**
 * Start a watcher service. Implementation stub — the session ↔ address
 * subscription bookkeeping, confirmation threshold math, and the graceful-
 * shutdown dance are tracked in issue #58's implementation PR. The
 * interface above is what the indexer integration layer targets.
 */
export function startWatcher(_opts: WatcherOptions): WatcherHandle {
  throw new Error(
    "startWatcher is not implemented yet — tracked in issue #58. " +
      "This interface is the stable contract between the watcher package " +
      "and the indexer's UTXO integration layer.",
  );
}
