import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { payments, customers, checkoutSessions } from "@paylix/db/schema";
import { authenticateApiKey } from "@/lib/api-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiKey(request, "secret");
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const [row] = await db
    .select({
      id: payments.id,
      amount: payments.amount,
      fee: payments.fee,
      status: payments.status,
      txHash: payments.txHash,
      chain: payments.chain,
      productId: payments.productId,
      externalCustomerId: customers.customerId,
      metadata: checkoutSessions.metadata,
    })
    .from(payments)
    .innerJoin(customers, eq(payments.customerId, customers.id))
    .leftJoin(checkoutSessions, eq(checkoutSessions.paymentId, payments.id))
    .where(and(eq(payments.id, id), eq(payments.userId, auth.user.id)));

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    verified: row.status === "confirmed" && !!row.txHash,
    amount: row.amount,
    fee: row.fee,
    txHash: row.txHash,
    chain: row.chain,
    customerId: row.externalCustomerId,
    productId: row.productId,
    status: row.status,
    metadata: row.metadata ?? {},
  });
}
