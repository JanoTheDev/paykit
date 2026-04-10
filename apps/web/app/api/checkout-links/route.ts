import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { checkoutSessions, products, users } from "@paylix/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const createCheckoutLinkSchema = z.object({
  productId: z.string().uuid(),
  customerId: z.string().optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      id: checkoutSessions.id,
      productId: checkoutSessions.productId,
      productName: products.name,
      customerId: checkoutSessions.customerId,
      merchantWallet: checkoutSessions.merchantWallet,
      amount: checkoutSessions.amount,
      currency: checkoutSessions.currency,
      chain: checkoutSessions.chain,
      type: checkoutSessions.type,
      status: checkoutSessions.status,
      successUrl: checkoutSessions.successUrl,
      cancelUrl: checkoutSessions.cancelUrl,
      metadata: checkoutSessions.metadata,
      paymentId: checkoutSessions.paymentId,
      subscriptionId: checkoutSessions.subscriptionId,
      viewedAt: checkoutSessions.viewedAt,
      completedAt: checkoutSessions.completedAt,
      expiresAt: checkoutSessions.expiresAt,
      createdAt: checkoutSessions.createdAt,
    })
    .from(checkoutSessions)
    .leftJoin(products, eq(checkoutSessions.productId, products.id))
    .where(eq(checkoutSessions.userId, session.user.id))
    .orderBy(desc(checkoutSessions.createdAt));

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createCheckoutLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Fetch the product
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, data.productId));

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (product.userId !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Get user's wallet address
  const [userRow] = await db
    .select({ walletAddress: users.walletAddress })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!userRow?.walletAddress) {
    return NextResponse.json(
      { error: "Wallet address not configured. Go to Settings to add your wallet." },
      { status: 400 }
    );
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const [checkoutSession] = await db
    .insert(checkoutSessions)
    .values({
      userId: session.user.id,
      productId: product.id,
      customerId: data.customerId ?? null,
      merchantWallet: userRow.walletAddress,
      amount: product.price,
      currency: product.currency,
      chain: product.chain,
      type: product.type,
      status: "active",
      successUrl: data.successUrl ?? null,
      cancelUrl: data.cancelUrl ?? null,
      expiresAt,
    })
    .returning();

  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const url = `${baseUrl}/checkout/${checkoutSession.id}`;

  return NextResponse.json(
    {
      id: checkoutSession.id,
      url,
      status: checkoutSession.status,
      expiresAt: checkoutSession.expiresAt,
    },
    { status: 201 }
  );
}
