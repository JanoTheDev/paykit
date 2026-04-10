import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { count, desc, eq, max, sql, sum } from "drizzle-orm";
import { customers, payments } from "@paylix/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import CustomersView, { type CustomerRow } from "./customers-view";

export default async function CustomersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const userId = session.user.id;

  const raw = await db
    .select({
      id: customers.id,
      firstName: customers.firstName,
      lastName: customers.lastName,
      email: customers.email,
      walletAddress: customers.walletAddress,
      totalSpent: sum(
        sql`CASE WHEN ${payments.status} = 'confirmed' THEN ${payments.amount} ELSE 0 END`,
      ),
      paymentCount: count(payments.id),
      lastPayment: max(payments.createdAt),
    })
    .from(customers)
    .leftJoin(payments, eq(customers.id, payments.customerId))
    .where(eq(customers.userId, userId))
    .groupBy(customers.id)
    .orderBy(desc(customers.createdAt));

  const rows: CustomerRow[] = raw.map((r) => ({
    id: r.id,
    name:
      r.firstName || r.lastName
        ? [r.firstName, r.lastName].filter(Boolean).join(" ")
        : "—",
    email: r.email,
    walletAddress: r.walletAddress,
    totalSpent: Number(r.totalSpent ?? 0),
    paymentCount: Number(r.paymentCount ?? 0),
    lastPayment: r.lastPayment ? new Date(r.lastPayment) : null,
  }));

  return <CustomersView rows={rows} />;
}
