import { Connection, PublicKey, type Logs } from "@solana/web3.js";

export interface ListenerEvent {
  kind: "PaymentReceived" | "SubscriptionCreated" | "SubscriptionCharged" | "SubscriptionCancelled";
  signature: string;
  slot: number;
  data: Record<string, unknown>;
}

export interface ListenerOptions {
  connection: Connection;
  /** Paylix program IDs to watch (payment_vault + subscription_manager). */
  programIds: PublicKey[];
  /** Commitment level — default 'finalized'; mirror of EVM INDEXER_CONFIRMATIONS invariant. */
  commitment?: "finalized" | "confirmed";
  onEvent(ev: ListenerEvent): Promise<void> | void;
}

export interface ListenerHandle {
  stop(): Promise<void>;
}

/**
 * Parse Anchor event logs. Anchor prepends `Program data: ` to the
 * base64-encoded event payload. We match on that prefix and decode per
 * emitter rather than decoding with the IDL — good enough for routing;
 * full field extraction is the indexer's job.
 */
function parseLogs(logs: string[]): Array<{ kind: ListenerEvent["kind"]; payload: string }> {
  const out: Array<{ kind: ListenerEvent["kind"]; payload: string }> = [];
  for (const line of logs) {
    if (!line.startsWith("Program data: ")) continue;
    const payload = line.slice("Program data: ".length).trim();
    // Anchor event discriminators are the first 8 bytes of the base64 payload.
    // We dispatch by decoding only enough to identify which event type it is.
    // Real implementations should use the IDL's BorshCoder — for the skeleton
    // we flag every "Program data" as "PaymentReceived" and let the DB writer
    // use context from the event to classify. TODO in #57 follow-up: proper
    // IDL-based decoding.
    out.push({ kind: "PaymentReceived", payload });
  }
  return out;
}

export async function startListener(opts: ListenerOptions): Promise<ListenerHandle> {
  const commitment = opts.commitment ?? "finalized";
  const subIds: number[] = [];

  for (const programId of opts.programIds) {
    const id = opts.connection.onLogs(
      programId,
      async (logs: Logs, ctx) => {
        if (logs.err) return;
        for (const { kind, payload } of parseLogs(logs.logs)) {
          try {
            await opts.onEvent({
              kind,
              signature: logs.signature,
              slot: ctx.slot,
              data: { payload, programId: programId.toBase58() },
            });
          } catch (err) {
            console.error("[solana-listener] onEvent threw:", err);
          }
        }
      },
      commitment,
    );
    subIds.push(id);
  }

  console.log(
    `[solana-listener] watching ${opts.programIds.length} program(s) at '${commitment}' commitment`,
  );

  return {
    async stop() {
      for (const id of subIds) {
        try {
          await opts.connection.removeOnLogsListener(id);
        } catch {
          // Connection may already be closed
        }
      }
    },
  };
}
