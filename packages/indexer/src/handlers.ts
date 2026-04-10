import { createDb } from "@paylix/db/client";
import { payments, subscriptions, checkoutSessions } from "@paylix/db/schema";
import { eq } from "drizzle-orm";
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

  // Try to find and update a pending payment by txHash
  if (log.transactionHash) {
    const [updated] = await db
      .update(payments)
      .set({
        status: "confirmed",
        blockNumber: log.blockNumber ? Number(log.blockNumber) : null,
      })
      .where(eq(payments.txHash, log.transactionHash))
      .returning();

    if (updated) {
      console.log(`[Handler] Payment ${updated.id} confirmed`);
      await dispatchWebhooks(updated.userId, "payment.confirmed", {
        paymentId: updated.id,
        txHash: log.transactionHash,
        amount: updated.amount,
        status: "confirmed",
      });
    } else {
      console.log("[Handler] No pending payment found for txHash:", log.transactionHash);
    }
  }
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
