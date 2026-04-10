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
  productId: `0x${string}`;
  customerId: `0x${string}`;
}) {
  console.log("[Handler] SubscriptionCreated:", {
    txHash: log.transactionHash,
    subscriptionId: args.subscriptionId.toString(),
    subscriber: args.subscriber,
    merchant: args.merchant,
    amount: args.amount.toString(),
    interval: args.interval.toString(),
  });

  if (!log.transactionHash) {
    console.log("[Handler] No transaction hash, skipping");
    return;
  }

  const onChainId = args.subscriptionId.toString();

  // Idempotency: if we already have a subscription for this onChainId, skip
  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.onChainId, onChainId))
    .limit(1);

  if (existing) {
    console.log(`[Handler] Subscription ${onChainId} already exists, skipping`);
    return;
  }

  const amountCents = Number(args.amount) / 10_000;
  const intervalSeconds = Number(args.interval);

  // Find matching checkout session: merchant + amount + type=subscription + not completed
  const [session] = await db
    .select()
    .from(checkoutSessions)
    .where(
      and(
        sql`lower(${checkoutSessions.merchantWallet}) = lower(${args.merchant})`,
        eq(checkoutSessions.amount, amountCents),
        eq(checkoutSessions.type, "subscription"),
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
      `[Handler] No matching subscription checkout session for merchant=${args.merchant} amount=${amountCents} cents`
    );
    return;
  }

  console.log(`[Handler] Matched subscription checkout session ${session.id}`);

  // Create or find customer
  const customerIdentifier = session.customerId || `anon_${args.subscriber}`;
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
        walletAddress: args.subscriber,
      })
      .returning();
    customer = created;
    console.log(`[Handler] Created customer ${customer.id}`);
  } else if (!customer.walletAddress) {
    await db
      .update(customers)
      .set({ walletAddress: args.subscriber })
      .where(eq(customers.id, customer.id));
  }

  // Create first payment (the initial charge happens atomically with createSubscription)
  const [payment] = await db
    .insert(payments)
    .values({
      productId: session.productId,
      userId: session.userId,
      customerId: customer.id,
      amount: amountCents,
      fee: 0, // fee is tracked per-charge in PaymentReceived; creation doesn't include it here
      status: "confirmed",
      txHash: log.transactionHash,
      chain: session.chain,
      token: session.currency,
      fromAddress: args.subscriber,
      toAddress: args.merchant,
      blockNumber: log.blockNumber ? Number(log.blockNumber) : null,
    })
    .returning();

  console.log(`[Handler] Created initial subscription payment ${payment.id}`);

  const now = new Date();
  const nextCharge = new Date(now.getTime() + intervalSeconds * 1000);

  // Create subscription row
  const [subscription] = await db
    .insert(subscriptions)
    .values({
      productId: session.productId,
      userId: session.userId,
      customerId: customer.id,
      subscriberAddress: args.subscriber,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: nextCharge,
      nextChargeDate: nextCharge,
      lastPaymentId: payment.id,
      onChainId,
    })
    .returning();

  console.log(`[Handler] Created subscription ${subscription.id} (onChainId: ${onChainId})`);

  // Mark checkout session completed and link to subscription
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
  await dispatchWebhooks(session.userId, "subscription.created", {
    subscriptionId: subscription.id,
    onChainId,
    checkoutId: session.id,
    productId: session.productId,
    customerId: customer.customerId,
    amount: amountCents,
    currency: session.currency,
    chain: session.chain,
    interval: intervalSeconds,
    subscriberAddress: args.subscriber,
    merchantAddress: args.merchant,
    txHash: log.transactionHash,
  });
}

export async function handleSubscriptionPaymentReceived(log: Log, args: {
  subscriptionId: bigint;
  subscriber: `0x${string}`;
  merchant: `0x${string}`;
  token: `0x${string}`;
  amount: bigint;
  fee: bigint;
  timestamp: bigint;
}) {
  console.log("[Handler] Subscription PaymentReceived:", {
    txHash: log.transactionHash,
    subscriptionId: args.subscriptionId.toString(),
    amount: args.amount.toString(),
  });

  if (!log.transactionHash) return;

  const onChainId = args.subscriptionId.toString();

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.onChainId, onChainId))
    .limit(1);

  if (!subscription) {
    // Subscription not yet created (SubscriptionCreated event may arrive in the
    // same batch). The initial charge's payment record is created by
    // handleSubscriptionCreated, so silently skip here.
    console.log(
      `[Handler] No subscription found for onChainId=${onChainId}; likely the initial charge. Skipping.`
    );
    return;
  }

  // Idempotency: if we already have a payment with this txHash linked to this
  // subscription's customer, skip.
  const [existingPayment] = await db
    .select()
    .from(payments)
    .where(eq(payments.txHash, log.transactionHash))
    .limit(1);

  if (existingPayment) {
    console.log(`[Handler] Payment for tx ${log.transactionHash} already exists, skipping`);
    return;
  }

  const amountCents = Number(args.amount) / 10_000;
  const feeCents = Number(args.fee) / 10_000;

  // Create payment record for recurring charge
  const [payment] = await db
    .insert(payments)
    .values({
      productId: subscription.productId,
      userId: subscription.userId,
      customerId: subscription.customerId,
      amount: amountCents,
      fee: feeCents,
      status: "confirmed",
      txHash: log.transactionHash,
      chain: "base",
      token: "USDC",
      fromAddress: args.subscriber,
      toAddress: args.merchant,
      blockNumber: log.blockNumber ? Number(log.blockNumber) : null,
    })
    .returning();

  console.log(`[Handler] Created recurring subscription payment ${payment.id}`);

  // Update subscription: advance nextChargeDate by interval
  // We compute the new nextChargeDate from the existing one if possible (so
  // schedules don't drift), else from now.
  const base = subscription.nextChargeDate
    ? new Date(subscription.nextChargeDate)
    : new Date();
  // We need the interval; read from the previous period length if available.
  const periodMs =
    subscription.currentPeriodEnd && subscription.currentPeriodStart
      ? new Date(subscription.currentPeriodEnd).getTime() -
        new Date(subscription.currentPeriodStart).getTime()
      : 0;

  const nextCharge =
    periodMs > 0
      ? new Date(base.getTime() + periodMs)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db
    .update(subscriptions)
    .set({
      status: "active",
      currentPeriodStart: base,
      currentPeriodEnd: nextCharge,
      nextChargeDate: nextCharge,
      lastPaymentId: payment.id,
    })
    .where(eq(subscriptions.id, subscription.id));

  console.log(
    `[Handler] Subscription ${subscription.id} advanced to next charge ${nextCharge.toISOString()}`
  );

  await dispatchWebhooks(subscription.userId, "subscription.charged", {
    subscriptionId: subscription.id,
    onChainId,
    paymentId: payment.id,
    amount: amountCents,
    fee: feeCents,
    txHash: log.transactionHash,
    nextChargeDate: nextCharge.toISOString(),
  });
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
