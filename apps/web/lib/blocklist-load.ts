import { db } from "./db";
import { blocklistEntries } from "@paylix/db/schema";
import { and, eq } from "drizzle-orm";

/**
 * Fetches the active blocklist entries for an org + mode. Split out so
 * the relay test suite can mock the blocklist without threading another
 * db.select mock into every existing test setup.
 */
export async function loadOrgBlocklist(
  organizationId: string,
  livemode: boolean,
): Promise<Array<{ type: "wallet" | "email" | "country"; value: string }>> {
  return db
    .select({ type: blocklistEntries.type, value: blocklistEntries.value })
    .from(blocklistEntries)
    .where(
      and(
        eq(blocklistEntries.organizationId, organizationId),
        eq(blocklistEntries.livemode, livemode),
      ),
    );
}
