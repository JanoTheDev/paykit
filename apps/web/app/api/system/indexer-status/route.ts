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
    return NextResponse.json({ online: false, lastSeen: null });
  }

  const ageSeconds = (Date.now() - new Date(row.updatedAt).getTime()) / 1000;
  const online = ageSeconds < 120;

  return NextResponse.json({
    online,
    lastSeen: row.updatedAt.toISOString(),
    ageSeconds: Math.floor(ageSeconds),
  });
}
