import { createDb } from "@paylix/db/client";
import { systemStatus } from "@paylix/db/schema";
import { eq } from "drizzle-orm";
import { config } from "./config";

const db = createDb(config.databaseUrl);

export async function getLastBlock(contractKey: string): Promise<bigint | null> {
  const [row] = await db
    .select()
    .from(systemStatus)
    .where(eq(systemStatus.key, `cursor_${contractKey}`));
  if (!row?.value) return null;
  return BigInt(row.value);
}

export async function setLastBlock(contractKey: string, blockNumber: bigint): Promise<void> {
  await db
    .insert(systemStatus)
    .values({ key: `cursor_${contractKey}`, value: blockNumber.toString() })
    .onConflictDoUpdate({
      target: systemStatus.key,
      set: { value: blockNumber.toString(), updatedAt: new Date() },
    });
}
