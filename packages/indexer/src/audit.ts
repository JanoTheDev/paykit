import { createDb } from "@paylix/db/client";
import { auditLogs } from "@paylix/db/schema";
import { config } from "./config";

/**
 * Record an audit log entry from the indexer. Mirrors apps/web/lib/audit.ts
 * but uses the indexer's own DB client. Never throws — failures are logged
 * and swallowed.
 *
 * userId is null for automated actions (keeper, listener).
 */
export async function recordAudit(args: {
  organizationId: string;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  details?: Record<string, unknown>;
}): Promise<void> {
  try {
    const db = createDb(config.databaseUrl);
    await db.insert(auditLogs).values({
      organizationId: args.organizationId,
      userId: null, // automated — no human actor
      action: args.action,
      resourceType: args.resourceType,
      resourceId: args.resourceId ?? null,
      details: args.details ?? {},
      ipAddress: null, // indexer has no client IP
    });
  } catch (err) {
    console.error("[Audit] Failed to record:", err);
  }
}
