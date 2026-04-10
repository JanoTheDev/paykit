import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { customers, products, subscriptions } from "@paylix/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import SubscribersView, { type SubscriberRow } from "./subscribers-view";

export default async function SubscribersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const rows = await db
    .select({
      id: subscriptions.id,
      status: subscriptions.status,
      createdAt: subscriptions.createdAt,
      nextChargeDate: subscriptions.nextChargeDate,
      onChainId: subscriptions.onChainId,
      productName: products.name,
      customerEmail: customers.email,
      customerWallet: customers.walletAddress,
    })
    .from(subscriptions)
    .leftJoin(products, eq(subscriptions.productId, products.id))
    .leftJoin(customers, eq(subscriptions.customerId, customers.id))
    .where(eq(subscriptions.userId, session.user.id))
    .orderBy(desc(subscriptions.createdAt));

  return <SubscribersView rows={rows as SubscriberRow[]} />;
}
