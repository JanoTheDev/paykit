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

  if (row.status !== "trial_conversion_failed") {
    return NextResponse.json(
      {
        error: {
          code: "not_failed_trial",
          message:
            "Only trial_conversion_failed subscriptions can be retried.",
        },
      },
      { status: 409 },
    );
  }

  if (!row.pendingPermitSignature) {
    return NextResponse.json(
      {
        error: {
          code: "missing_signature",
          message:
            "Pending permit signature has been cleared; customer must re-checkout.",
        },
      },
      { status: 409 },
    );
  }

  await db
    .update(subscriptions)
    .set({
      status: "trialing",
      trialConversionAttempts: 0,
      trialConversionLastError: null,
      trialEndsAt: new Date(),
    })
    .where(eq(subscriptions.id, id));

  return NextResponse.json({ ok: true });
}
