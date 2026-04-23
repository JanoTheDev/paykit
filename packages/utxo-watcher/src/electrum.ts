/**
 * Electrum protocol client abstraction. Paylix uses Electrum (not a full
 * Bitcoin node) for watching incoming payments to derived addresses. This
 * keeps self-host ops costs low — no 500GB block storage, no weeks of
 * initial sync.
 *
 * Tradeoff: Electrum backends are third-party SPV gateways. Operators who
 * need full sovereignty should run their own Electrum server (electrs,
 * fulcrum) and point this at it via env var.
 *
 * This file declares the interface and a transport stub. The WebSocket
 * Electrum client implementation is deferred to issue #58's follow-up PR.
 */

import type { UtxoChainDescriptor } from "./descriptors";

/** Minimal shape returned by the Electrum `blockchain.scripthash.get_history` method. */
export interface ElectrumHistoryEntry {
  /** Transaction hash (little-endian hex, no 0x prefix). */
  tx_hash: string;
  /** Block height confirmations happened at. 0 means mempool. */
  height: number;
  /** Transaction fee in satoshis (not always populated by every server). */
  fee?: number;
}

/** Relevant output in a scanned transaction. */
export interface AddressPaymentHit {
  txid: string;
  blockHeight: number;
  confirmations: number;
  /** Output index that matched the watched address. */
  vout: number;
  /** Value in satoshis (bigint for 18-decimal-safe arithmetic across UTXO tools). */
  valueSats: bigint;
}

export interface ElectrumClient {
  /** Subscribe to an address. The callback fires on each new history entry. */
  subscribeAddress(
    address: string,
    onHit: (hit: AddressPaymentHit) => void | Promise<void>,
  ): Promise<() => void>;

  /** Read current chain tip height for confirmation-count math. */
  getTipHeight(): Promise<number>;

  /** Close the underlying connection. */
  close(): Promise<void>;
}

export interface ElectrumClientOptions {
  endpoint: string;
  descriptor: UtxoChainDescriptor;
  /** Reconnect delay in ms (default: 2000). */
  reconnectDelayMs?: number;
}

/**
 * Factory. Implementation stub — the WebSocket transport + line-framed
 * Electrum protocol codec is in-flight under issue #58.
 */
export function createElectrumClient(_opts: ElectrumClientOptions): ElectrumClient {
  throw new Error(
    "createElectrumClient is not implemented yet — tracked in issue #58. " +
      "The interface above is stable; implementation will plug in.",
  );
}
