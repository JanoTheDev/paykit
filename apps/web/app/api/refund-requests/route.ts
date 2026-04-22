import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { refundRequests } from "@paylix/db/schema";
import { desc } from "drizzle-orm";
import { resolveActiveOrg } from "@/lib/require-active-org";
import { orgScope } from "@/lib/org-scope";

export async function GET() {
  const ctx = await resolveActiveOrg();
  if (!ctx.ok) return ctx.response;
  const { organizationId, livemode } = ctx;

  const rows = await db
    .select()
    .from(refundRequests)
    .where(orgScope(refundRequests, { organizationId, livemode }))
    .orderBy(desc(refundRequests.createdAt));

  return NextResponse.json(rows);
}
