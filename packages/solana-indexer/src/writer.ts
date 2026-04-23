/**
 * Storage bridge for the Solana indexer. Same pattern as the UTXO bridge:
 * decouples the listener from any specific database so tests can use an
 * in-memory fake and operators can plug in Drizzle / Prisma / custom SQL.
 *
 * The caller supplies write callbacks; we call them with decoded events.
 * Error handling is delegated to the caller — we don't retry inside the
 * listener's onEvent because returning an error from onEvent is swallowed
 * by Solana's onLogs subscriber anyway.
 */

import type { DecodedEvent } from "./decoder";
import type { ListenerEvent } from "./listener";

export interface WriterCallbacks {
  recordPayment(ev: {
    signature: string;
    slot: number;
    programId: string;
    buyer: string;
    merchant: string;
    mint: string;
    amount: bigint;
    fee: bigint;
    productId: string;
    customerId: string;
  }): Promise<void>;
  recordSubscriptionCreated(ev: {
    signature: string;
    slot: number;
    programId: string;
    subscriptionId: bigint;
    subscriber: string;
    merchantAta: string;
    mint: string;
    amount: bigint;
    intervalSeconds: bigint;
    productId: string;
    customerId: string;
  }): Promise<void>;
  recordSubscriptionCharged(ev: {
    signature: string;
    slot: number;
    programId: string;
    subscriptionId: bigint;
    subscriber: string;
    merchantAta: string;
    mint: string;
    amount: bigint;
  }): Promise<void>;
  recordSubscriptionCancelled(ev: {
    signature: string;
    slot: number;
    programId: string;
    subscriptionId: bigint;
  }): Promise<void>;
}

/**
 * Dispatch a ListenerEvent to the appropriate writer callback. Safe to
 * pass directly as the `onEvent` handler when calling `startListener`.
 */
export function makeEventHandler(cbs: WriterCallbacks) {
  return async function onEvent(le: ListenerEvent): Promise<void> {
    const common = { signature: le.signature, slot: le.slot, programId: le.programId };
    const ev: DecodedEvent = le.event;
    switch (ev.kind) {
      case "PaymentReceived":
        return cbs.recordPayment({ ...common, ...ev });
      case "SubscriptionCreated":
        return cbs.recordSubscriptionCreated({ ...common, ...ev });
      case "SubscriptionCharged":
        return cbs.recordSubscriptionCharged({ ...common, ...ev });
      case "SubscriptionCancelled":
        return cbs.recordSubscriptionCancelled({ ...common, ...ev });
    }
  };
}
