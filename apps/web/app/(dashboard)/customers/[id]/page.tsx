import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import {
  customers,
  payments,
  products,
  subscriptions,
} from "@paylix/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import CustomerDetailView from "./customer-detail-view";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const userId = session.user.id;
  const { id } = await params;

  const [customer] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.userId, userId)))
    .limit(1);

  if (!customer) notFound();

  const [customerPayments, customerSubscriptions] = await Promise.all([
    db
      .select({
        id: payments.id,
        amount: payments.amount,
        fee: payments.fee,
        status: payments.status,
        txHash: payments.txHash,
        createdAt: payments.createdAt,
        productName: products.name,
      })
      .from(payments)
      .leftJoin(products, eq(payments.productId, products.id))
      .where(and(eq(payments.customerId, id), eq(payments.userId, userId)))
      .orderBy(desc(payments.createdAt)),
    db
      .select({
        id: subscriptions.id,
        status: subscriptions.status,
        createdAt: subscriptions.createdAt,
        nextChargeDate: subscriptions.nextChargeDate,
        productName: products.name,
      })
      .from(subscriptions)
      .leftJoin(products, eq(subscriptions.productId, products.id))
      .where(
        and(
          eq(subscriptions.customerId, id),
          eq(subscriptions.userId, userId),
        ),
      )
      .orderBy(desc(subscriptions.createdAt)),
  ]);

  const name =
    customer.firstName || customer.lastName
      ? [customer.firstName, customer.lastName].filter(Boolean).join(" ")
      : null;

  const metadata = customer.metadata as Record<string, string> | null;

  return (
    <CustomerDetailView
      customer={{
        id: customer.id,
        name,
        email: customer.email,
        phone: customer.phone,
        walletAddress: customer.walletAddress,
      }}
      metadata={metadata}
      payments={customerPayments}
      subscriptions={customerSubscriptions}
    />
  );
}
