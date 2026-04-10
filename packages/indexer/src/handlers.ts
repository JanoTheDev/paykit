import { createDb } from "@paylix/db/client";
import { payments, subscriptions, checkoutSessions, customers } from "@paylix/db/schema";
import { eq, and, or, desc, sql } from "drizzle-orm";
import { config } from "./config";
import { dispatchWebhooks } from "./webhook-dispatch";
import type { Log } from "viem";

const db = createDb(config.databaseUrl);

export async function handlePaymentReceived(log: Log, args: {
  payer: `0x${string}`;
  merchant: `0x${string}`;
  token: `0x${string}`;
  amount: bigint;
  fee: bigint;
  productId: `0x${string}`;
  customerId: `0x${string}`;
  timestamp: bigint;
}) {
  console.log("[Handler] PaymentReceived:", {
    txHash: log.transactionHash,
    payer: args.payer,
    merchant: args.merchant,
    amount: args.amount.toString(),
    blockNumber: log.blockNumber?.toString(),
  });

  if (!log.transactionHash) {
    console.log("[Handler] No transaction hash, skipping");
    return;
  }

  // Convert on-chain amount (USDC 6 decimals) back to cents
  // 1 USDC = 1,000,000 units = 100 cents
  const amountCents = Number(args.amount) / 10_000;

  // Find the most recent viewed checkout session matching this merchant + amount that isn't completed yet
  const [session] = await db
    .select()
    .from(checkoutSessions)
    .where(
      and(
        sql`lower(${checkoutSessions.merchantWallet}) = lower(${args.merchant})`,
        eq(checkoutSessions.amount, amountCents),
        or(
          eq(checkoutSessions.status, "viewed"),
          eq(checkoutSessions.status, "active")
        )
      )
    )
    .orderBy(desc(checkoutSessions.createdAt))
    .limit(1);

  if (!session) {
    console.log(
      `[Handler] No matching checkout session for merchant=${args.merchant} amount=${amountCents} cents`
    );
    return;
  }

  console.log(`[Handler] Matched checkout session ${session.id}`);

  // Create or find customer record
  const customerIdentifier = session.customerId || `anon_${args.payer}`;
  let [customer] = await db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.userId, session.userId),
        eq(customers.customerId, customerIdentifier)
      )
    );

  if (!customer) {
    const [created] = await db
      .insert(customers)
      .values({
        userId: session.userId,
        customerId: customerIdentifier,
        walletAddress: args.payer,
      })
      .returning();
    customer = created;
    console.log(`[Handler] Created customer ${customer.id}`);
  } else if (!customer.walletAddress) {
    await db
      .update(customers)
      .set({ walletAddress: args.payer })
      .where(eq(customers.id, customer.id));
  }

  // Create payment record
  const [payment] = await db
    .insert(payments)
    .values({
      productId: session.productId,
      userId: session.userId,
      customerId: customer.id,
      amount: amountCents,
      fee: Number(args.fee) / 10_000,
      status: "confirmed",
      txHash: log.transactionHash,
      chain: session.chain,
      token: session.currency,
      fromAddress: args.payer,
      toAddress: args.merchant,
      blockNumber: log.blockNumber ? Number(log.blockNumber) : null,
    })
    .returning();

  console.log(`[Handler] Created payment ${payment.id}`);

  // Update checkout session to completed
  await db
    .update(checkoutSessions)
    .set({
      status: "completed",
      completedAt: new Date(),
      paymentId: payment.id,
    })
    .where(eq(checkoutSessions.id, session.id));

  console.log(`[Handler] Checkout session ${session.id} marked completed`);

  // Dispatch webhook
  await dispatchWebhooks(session.userId, "payment.confirmed", {
    paymentId: payment.id,
    checkoutId: session.id,
    productId: session.productId,
    customerId: customer.customerId,
    amount: payment.amount,
    fee: payment.fee,
    currency: payment.token,
    chain: payment.chain,
    txHash: log.transactionHash,
    fromAddress: args.payer,
    toAddress: args.merchant,
  });
}

export async function handleSubscriptionCreated(log: Log, args: {
  subscriptionId: bigint;
  subscriber: `0x${string}`;
  merchant: `0x${string}`;
  token: `0x${string}`;
  amount: bigint;
  interval: bigint;
}) {
  console.log("[Handler] SubscriptionCreated:", {
    txHash: log.transactionHash,
    subscriptionId: args.subscriptionId.toString(),
    subscriber: args.subscriber,
    merchant: args.merchant,
    amount: args.amount.toString(),
  });

  // Full matching logic (linking on-chain subscriptions to checkout sessions)
  // will be refined when the checkout page is built.
}

export async function handleSubscriptionPastDue(log: Log, args: {
  subscriptionId: bigint;
}) {
  console.log("[Handler] SubscriptionPastDue:", {
    txHash: log.transactionHash,
    subscriptionId: args.subscriptionId.toString(),
  });

  const onChainId = args.subscriptionId.toString();

  const [updated] = await db
    .update(subscriptions)
    .set({ status: "past_due" })
    .where(eq(subscriptions.onChainId, onChainId))
    .returning();

  if (updated) {
    console.log(`[Handler] Subscription ${updated.id} marked past_due`);
    await dispatchWebhooks(updated.userId, "subscription.past_due", {
      subscriptionId: updated.id,
      onChainId,
      status: "past_due",
    });
  }
}

export async function handleSubscriptionCancelled(log: Log, args: {
  subscriptionId: bigint;
}) {
  console.log("[Handler] SubscriptionCancelled:", {
    txHash: log.transactionHash,
    subscriptionId: args.subscriptionId.toString(),
  });

  const onChainId = args.subscriptionId.toString();

  const [updated] = await db
    .update(subscriptions)
    .set({ status: "cancelled" })
    .where(eq(subscriptions.onChainId, onChainId))
    .returning();

  if (updated) {
    console.log(`[Handler] Subscription ${updated.id} cancelled`);
    await dispatchWebhooks(updated.userId, "subscription.cancelled", {
      subscriptionId: updated.id,
      onChainId,
      status: "cancelled",
    });
  }
}
