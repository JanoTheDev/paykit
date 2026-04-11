import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { customers, invoices, payments, products } from "@paylix/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import PaymentsView, { type PaymentRow } from "./payments-view";

export default async function PaymentsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const rows = await db
    .select({
      id: payments.id,
      amount: payments.amount,
      fee: payments.fee,
      status: payments.status,
      txHash: payments.txHash,
      createdAt: payments.createdAt,
      productName: products.name,
      productType: products.type,
      customerEmail: customers.email,
      customerWallet: customers.walletAddress,
      invoiceNumber: invoices.number,
      invoiceHostedToken: invoices.hostedToken,
    })
    .from(payments)
    .leftJoin(products, eq(payments.productId, products.id))
    .leftJoin(customers, eq(payments.customerId, customers.id))
    .leftJoin(invoices, eq(invoices.paymentId, payments.id))
    .where(eq(payments.userId, session.user.id))
    .orderBy(desc(payments.createdAt));

  return <PaymentsView rows={rows as PaymentRow[]} />;
}
