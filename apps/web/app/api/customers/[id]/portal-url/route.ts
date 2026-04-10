import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { customers } from "@paylix/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { signPortalToken } from "@/lib/portal-tokens";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [customer] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.userId, session.user.id)));

  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const token = signPortalToken(customer.id);
  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  return NextResponse.json({
    url: `${baseUrl}/portal/${customer.id}?token=${token}`,
  });
}
