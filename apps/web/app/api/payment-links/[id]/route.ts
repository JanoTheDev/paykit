import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { paymentLinks } from "@paylix/db/schema";
import { and, eq } from "drizzle-orm";
import { resolveActiveOrg } from "@/lib/require-active-org";
import { orgScope } from "@/lib/org-scope";
import { recordAudit } from "@/lib/audit";
import { apiError } from "@/lib/api-error";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await resolveActiveOrg();
  if (!ctx.ok) return ctx.response;
  const { organizationId, userId, livemode } = ctx;

  const { id } = await params;

  const [updated] = await db
    .update(paymentLinks)
    .set({ isActive: false })
    .where(
      and(eq(paymentLinks.id, id), orgScope(paymentLinks, { organizationId, livemode })),
    )
    .returning();
  if (!updated) return apiError("not_found", "Not found", 404);

  void recordAudit({
    organizationId,
    userId,
    action: "payment_link.archived",
    resourceType: "payment_link",
    resourceId: id,
    ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  });

  return NextResponse.json({ success: true });
}
