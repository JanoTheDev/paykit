import { Connection, PublicKey, type Logs } from "@solana/web3.js";
import { decodeProgramData, type DecodedEvent } from "./decoder";

export interface ListenerEvent {
  signature: string;
  slot: number;
  programId: string;
  event: DecodedEvent;
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
 * base64-encoded event payload. The decoder module identifies each event
 * via its 8-byte discriminator and Borsh-decodes the fields.
 */
function parseLogs(logs: string[]): DecodedEvent[] {
  const out: DecodedEvent[] = [];
  for (const line of logs) {
    if (!line.startsWith("Program data: ")) continue;
    const payload = line.slice("Program data: ".length).trim();
    const decoded = decodeProgramData(payload);
    if (decoded) out.push(decoded);
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
        for (const event of parseLogs(logs.logs)) {
          try {
            await opts.onEvent({
              signature: logs.signature,
              slot: ctx.slot,
              programId: programId.toBase58(),
              event,
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
