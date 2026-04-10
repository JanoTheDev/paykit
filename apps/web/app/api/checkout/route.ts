import { db } from "@/lib/db";
import { checkoutSessions, products } from "@paylix/db/schema";
import { authenticateApiKey } from "@/lib/api-auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const createCheckoutSchema = z.object({
  productId: z.string().uuid(),
  customerId: z.string().optional(),
  merchantWallet: z.string().startsWith("0x"),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  type: z.enum(["one_time", "subscription"]).optional(),
  metadata: z.record(z.string()).optional(),
});

export async function POST(request: Request) {
  const auth = await authenticateApiKey(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createCheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, parsed.data.productId));

  if (!product || product.userId !== auth.user.id) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (!product.isActive) {
    return NextResponse.json({ error: "Product is inactive" }, { status: 400 });
  }

  const [session] = await db
    .insert(checkoutSessions)
    .values({
      userId: auth.user.id,
      productId: product.id,
      customerId: parsed.data.customerId ?? null,
      merchantWallet: parsed.data.merchantWallet,
      amount: product.price,
      currency: product.currency,
      chain: product.chain,
      type: parsed.data.type || product.type,
      successUrl: parsed.data.successUrl ?? null,
      cancelUrl: parsed.data.cancelUrl ?? null,
      metadata: parsed.data.metadata || {},
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min for SDK checkouts
    })
    .returning();

  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

  return NextResponse.json({
    checkoutUrl: `${baseUrl}/checkout/${session.id}`,
    checkoutId: session.id,
    subscriptionId: product.type === "subscription" ? session.id : undefined,
  }, { status: 201 });
}
