import { and, eq, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { customers, subscriptions } from "@paylix/db/schema";

export async function checkExistingSubscription(args: {
  organizationId: string;
  productId: string;
  buyerWallet: string;
  customerIdentifier: string | null;
  intent: "trial" | "subscription";
}): Promise<{ exists: boolean }> {
  const { organizationId, productId, buyerWallet, customerIdentifier, intent } = args;

  let matchedCustomer: { id: string; email: string | null } | null = null;
  if (customerIdentifier) {
    const [c] = await db
      .select({ id: customers.id, email: customers.email })
      .from(customers)
      .where(
        and(
          eq(customers.organizationId, organizationId),
          eq(customers.customerId, customerIdentifier),
        ),
      )
      .limit(1);
    matchedCustomer = c ?? null;
  }

  const conditions = [
    sql`lower(${subscriptions.subscriberAddress}) = lower(${buyerWallet})`,
  ];

  if (matchedCustomer) {
    conditions.push(eq(subscriptions.customerId, matchedCustomer.id));
  }

  if (matchedCustomer?.email) {
    conditions.push(sql`${subscriptions.customerId} IN (
      SELECT ${customers.id} FROM ${customers}
      WHERE ${customers.organizationId} = ${organizationId}
        AND lower(${customers.email}) = lower(${matchedCustomer.email})
    )`);
  }

  const statusFilter =
    intent === "trial"
      ? or(
          eq(subscriptions.status, "trialing"),
          eq(subscriptions.status, "active"),
          eq(subscriptions.status, "past_due"),
          eq(subscriptions.status, "cancelled"),
          eq(subscriptions.status, "trial_conversion_failed"),
          eq(subscriptions.status, "expired"),
        )
      : or(
          eq(subscriptions.status, "trialing"),
          eq(subscriptions.status, "active"),
          eq(subscriptions.status, "past_due"),
        );

  const existing = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.organizationId, organizationId),
        eq(subscriptions.productId, productId),
        statusFilter,
        or(...conditions),
      ),
    )
    .limit(1);

  return { exists: existing.length > 0 };
}
