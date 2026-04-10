import { startListener } from "./listener";
import { runKeeper } from "./keeper";
import { config } from "./config";
import { createDb } from "@paylix/db/client";
import { systemStatus } from "@paylix/db/schema";
import { retryFailedWebhooks } from "./webhook-dispatch";
import { retryUnmatchedEvents } from "./handlers";

async function main() {
  console.log("=================================");
  console.log("  Paylix Indexer + Keeper");
  console.log(`  Network: ${config.network}`);
  console.log("=================================");

  await startListener();
  await runKeeper();

  const db = createDb(config.databaseUrl);

  async function sendHeartbeat() {
    try {
      await db
        .insert(systemStatus)
        .values({ key: "indexer_heartbeat", value: "ok" })
        .onConflictDoUpdate({
          target: systemStatus.key,
          set: { value: "ok", updatedAt: new Date() },
        });
    } catch (err) {
      console.error("[Heartbeat] Failed:", err);
    }
  }

  await sendHeartbeat();
  setInterval(sendHeartbeat, 30 * 1000);
  console.log("[Heartbeat] Sending every 30 seconds.");

  // Keeper interval: prefer KEEPER_INTERVAL_MS (millisecond override) for
  // short intervals (e.g. testing with the "minutely" billing interval),
  // otherwise fall back to KEEPER_INTERVAL_MINUTES.
  const keeperIntervalMs = parseInt(
    process.env.KEEPER_INTERVAL_MS ?? "30000",
    10
  );

  // Recursive setTimeout + running flag prevents overlapping keeper runs
  // from double-charging subscriptions when a run takes longer than the
  // interval.
  let keeperRunning = false;

  async function scheduleKeeper() {
    if (keeperRunning) {
      setTimeout(scheduleKeeper, keeperIntervalMs);
      return;
    }
    keeperRunning = true;
    try {
      await runKeeper();
    } catch (err) {
      console.error("[Keeper] Unhandled error:", err);
    } finally {
      keeperRunning = false;
      setTimeout(scheduleKeeper, keeperIntervalMs);
    }
  }

  setTimeout(scheduleKeeper, keeperIntervalMs);
  console.log(`[Keeper] Scheduled every ${keeperIntervalMs}ms`);

  // Webhook retry sweep: re-deliver failed webhook deliveries whose
  // nextRetryAt has elapsed (bounded to 5 attempts total).
  setInterval(() => {
    retryFailedWebhooks().catch((err) =>
      console.error("[Webhook Retry] Error:", err)
    );
  }, 60 * 1000);
  console.log("[Webhook Retry] Scheduled every 60s");

  // Unmatched event retry sweep: re-runs handlers for events that arrived
  // before the corresponding checkout session was committed. Bounded to 50
  // per tick.
  setInterval(() => {
    retryUnmatchedEvents().catch((err) =>
      console.error("[Unmatched Retry] Error:", err)
    );
  }, 30 * 1000);
  console.log("[Unmatched Retry] Scheduled every 30s");

  console.log("[Indexer] Running. Press Ctrl+C to stop.");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
