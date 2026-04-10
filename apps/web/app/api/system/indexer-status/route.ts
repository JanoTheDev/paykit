import { db } from "@/lib/db";
import { systemStatus } from "@paylix/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const [row] = await db
    .select()
    .from(systemStatus)
    .where(eq(systemStatus.key, "indexer_heartbeat"));

  if (!row) {
    return NextResponse.json({
      online: false,
      ready: false,
      status: "offline",
      lastSeen: null,
    });
  }

  const ageSeconds = (Date.now() - new Date(row.updatedAt).getTime()) / 1000;
  const alive = ageSeconds < 120;
  const ready = row.value === "ok";

  // Three-state report:
  //   "offline"  — heartbeat stale, indexer is not running
  //   "starting" — heartbeat fresh but listener still backfilling
  //   "online"   — heartbeat fresh AND listener watching live events
  const status: "offline" | "starting" | "online" = !alive
    ? "offline"
    : ready
      ? "online"
      : "starting";

  return NextResponse.json({
    online: alive && ready,
    ready,
    status,
    lastSeen: row.updatedAt.toISOString(),
    ageSeconds: Math.floor(ageSeconds),
  });
}
