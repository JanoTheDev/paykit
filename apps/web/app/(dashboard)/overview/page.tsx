import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, count, eq, gte, sum, sql } from "drizzle-orm";
import { payments, subscriptions } from "@paylix/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireActiveOrg } from "@/lib/require-active-org";
import OverviewView from "./overview-view";

export default async function OverviewPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  let organizationId: string;
  try {
    organizationId = requireActiveOrg(session);
  } catch {
    redirect("/login");
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalRevenueResult,
    revenue30dResult,
    paymentCountResult,
    activeSubsResult,
    recentPayments,
  ] = await Promise.all([
    db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(
        and(eq(payments.organizationId, organizationId), eq(payments.status, "confirmed")),
      ),
    db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(
        and(
          eq(payments.organizationId, organizationId),
          eq(payments.status, "confirmed"),
          gte(payments.createdAt, thirtyDaysAgo),
        ),
      ),
    db
      .select({ count: count() })
      .from(payments)
      .where(eq(payments.organizationId, organizationId)),
    db
      .select({ count: count() })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.organizationId, organizationId),
          eq(subscriptions.status, "active"),
        ),
      ),
    db
      .select({
        id: payments.id,
        amount: payments.amount,
        status: payments.status,
        txHash: payments.txHash,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .where(eq(payments.organizationId, organizationId))
      .orderBy(sql`${payments.createdAt} desc`)
      .limit(10),
  ]);

  const totalRevenue = Number(totalRevenueResult[0]?.total ?? 0);
  const revenue30d = Number(revenue30dResult[0]?.total ?? 0);
  const paymentCount = paymentCountResult[0]?.count ?? 0;
  const activeSubs = activeSubsResult[0]?.count ?? 0;

  return (
    <OverviewView
      totalRevenue={totalRevenue}
      revenue30d={revenue30d}
      paymentCount={paymentCount}
      activeSubs={activeSubs}
      recentPayments={recentPayments}
    />
  );
}
