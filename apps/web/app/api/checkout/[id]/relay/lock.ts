import { and, eq, isNull, lt, or } from "drizzle-orm";
import { checkoutSessions } from "@paylix/db/schema";
import type { db as dbType } from "@/lib/db";

/**
 * Stale-lock grace period. If a relay request crashed or hung, the in-flight
 * marker will be cleared after this many milliseconds so a fresh request can
 * acquire the lock. Five minutes is long enough that a legitimate on-chain
 * submission will have completed (Base Sepolia is <5s typical), short enough
 * to recover quickly from a crash.
 */
export const STALE_LOCK_MS = 5 * 60 * 1000;

/**
 * Atomically acquires the relay lock on a checkout session. Returns true if
 * the caller now holds the lock, false if another request is already holding
 * it (and the lock hasn't gone stale).
 *
 * Implemented as a conditional UPDATE: sets relay_in_flight_at = NOW() only
 * if it's currently NULL or older than STALE_LOCK_MS. Postgres' UPDATE with
 * a WHERE clause is atomic at the row level, so two concurrent callers will
 * always result in exactly one winner.
 */
export async function acquireRelayLock(
  db: typeof dbType,
  sessionId: string,
): Promise<boolean> {
  const staleCutoff = new Date(Date.now() - STALE_LOCK_MS);

  const result = await db
    .update(checkoutSessions)
    .set({ relayInFlightAt: new Date() })
    .where(
      and(
        eq(checkoutSessions.id, sessionId),
        or(
          isNull(checkoutSessions.relayInFlightAt),
          lt(checkoutSessions.relayInFlightAt, staleCutoff),
        ),
      ),
    )
    .returning({ id: checkoutSessions.id });

  return result.length > 0;
}

/**
 * Releases the relay lock (clears relay_in_flight_at). Called after a
 * terminal failure so the user can retry without waiting for the stale
 * timeout. On success, the lock is left in place — the indexer will mark
 * the session completed, which eventually clears the lock via the normal
 * session lifecycle.
 */
export async function releaseRelayLock(
  db: typeof dbType,
  sessionId: string,
): Promise<void> {
  await db
    .update(checkoutSessions)
    .set({ relayInFlightAt: null })
    .where(eq(checkoutSessions.id, sessionId));
}
