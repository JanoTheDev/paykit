import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { subscriptions } from "@paylix/db/schema";
import { eq, and } from "drizzle-orm";
import { resolveActiveOrg } from "@/lib/require-active-org";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await resolveActiveOrg();
  if (!ctx.ok) return ctx.response;
  const { organizationId } = ctx;

  const { id } = await params;

  const [row] = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.id, id),
        eq(subscriptions.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!row) {
    return NextResponse.json(
      { error: { code: "not_found" } },
      { status: 404 },
    );
  }

  if (row.status !== "trialing" && row.status !== "trial_conversion_failed") {
    return NextResponse.json(
      {
        error: {
          code: "not_in_trial",
          message:
            "Only trialing or failed-trial subscriptions can be cancelled this way.",
        },
      },
      { status: 409 },
    );
  }

  await db
    .update(subscriptions)
    .set({ status: "cancelled", pendingPermitSignature: null })
    .where(eq(subscriptions.id, id));

  return NextResponse.json({ ok: true });
}
