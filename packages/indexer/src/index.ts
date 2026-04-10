import { startListener } from "./listener";
import { runKeeper } from "./keeper";
import { config } from "./config";
import { createDb } from "@paylix/db/client";
import { systemStatus } from "@paylix/db/schema";

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

  const intervalMs = config.keeperIntervalMinutes * 60 * 1000;
  setInterval(async () => {
    try {
      await runKeeper();
    } catch (error) {
      console.error("[Keeper] Unhandled error:", error);
    }
  }, intervalMs);

  console.log(`[Keeper] Scheduled every ${config.keeperIntervalMinutes} minutes`);
  console.log("[Indexer] Running. Press Ctrl+C to stop.");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
