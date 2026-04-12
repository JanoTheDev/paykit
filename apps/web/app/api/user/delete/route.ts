import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@paylix/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json(
      { error: { code: "unauthorized", message: "Not signed in" } },
      { status: 401 },
    );
  }

  await db.delete(user).where(eq(user.id, session.user.id));

  return NextResponse.json({ ok: true });
}
