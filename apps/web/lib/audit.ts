import { db } from "@/lib/db";
import { auditLogs } from "@paylix/db/schema";

export async function recordAudit(args: {
  organizationId: string;
  userId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
}): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      organizationId: args.organizationId,
      userId: args.userId ?? null,
      action: args.action,
      resourceType: args.resourceType,
      resourceId: args.resourceId ?? null,
      details: args.details ?? {},
      ipAddress: args.ipAddress ?? null,
    });
  } catch (err) {
    console.error("[Audit] Failed to record:", err);
  }
}
