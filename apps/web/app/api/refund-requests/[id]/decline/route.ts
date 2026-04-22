import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { refundRequests } from "@paylix/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { resolveActiveOrg } from "@/lib/require-active-org";
import { orgScope } from "@/lib/org-scope";
import { recordAudit } from "@/lib/audit";
import { apiError } from "@/lib/api-error";
import { dispatchWebhooks } from "@/lib/webhook-dispatch";

const schema = z.object({
  reason: z.string().max(500).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await resolveActiveOrg();
  if (!ctx.ok) return ctx.response;
  const { organizationId, userId, livemode } = ctx;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return apiError("validation_failed", "bad body");

  const [updated] = await db
    .update(refundRequests)
    .set({
      status: "declined",
      merchantReason: parsed.data.reason ?? null,
      decidedBy: userId,
      decidedAt: new Date(),
    })
    .where(
      and(
        eq(refundRequests.id, id),
        eq(refundRequests.status, "pending"),
        orgScope(refundRequests, { organizationId, livemode }),
      ),
    )
    .returning();
  if (!updated) {
    return apiError("not_found", "Pending request not found", 404);
  }

  void recordAudit({
    organizationId,
    userId,
    action: "refund_request.declined",
    resourceType: "refund_request",
    resourceId: id,
    details: { reason: parsed.data.reason ?? null },
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  });

  void dispatchWebhooks(organizationId, "refund.declined", {
    refundRequestId: updated.id,
    paymentId: updated.paymentId,
    customerId: updated.customerId,
    amount: updated.amount,
    merchantReason: updated.merchantReason,
  }).catch((err) =>
    console.error("[refund-request decline] webhook failed:", err),
  );

  return NextResponse.json(updated);
}
