import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { customers } from "@paylix/db/schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

const patchSchema = z.object({
  firstName: z.string().trim().max(100).nullish(),
  lastName: z.string().trim().max(100).nullish(),
  email: z.string().trim().email().nullish(),
  walletAddress: z.string().trim().max(100).nullish(),
  phone: z.string().trim().max(50).nullish(),
  country: z.string().trim().length(2).nullish(),
  taxId: z.string().trim().max(100).nullish(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const updates: Record<string, unknown> = {};
  if (data.firstName !== undefined) updates.firstName = data.firstName ?? null;
  if (data.lastName !== undefined) updates.lastName = data.lastName ?? null;
  if (data.email !== undefined) updates.email = data.email ?? null;
  if (data.walletAddress !== undefined)
    updates.walletAddress = data.walletAddress ?? null;
  if (data.phone !== undefined) updates.phone = data.phone ?? null;
  if (data.country !== undefined)
    updates.country = data.country ? data.country.toUpperCase() : null;
  if (data.taxId !== undefined) updates.taxId = data.taxId ?? null;
  if (data.metadata !== undefined) updates.metadata = data.metadata;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const [updated] = await db
    .update(customers)
    .set(updates)
    .where(and(eq(customers.id, id), eq(customers.userId, session.user.id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ customer: updated });
}
