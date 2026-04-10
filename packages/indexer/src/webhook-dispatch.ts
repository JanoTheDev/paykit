import { createDb } from "@paylix/db/client";
import { webhooks, webhookDeliveries } from "@paylix/db/schema";
import { eq, and } from "drizzle-orm";
import { createHmac } from "crypto";
import { config } from "./config";

const db = createDb(config.databaseUrl);

export async function dispatchWebhooks(
  userId: string,
  event: string,
  data: Record<string, unknown>
) {
  if (!userId) return;

  const userWebhooks = await db
    .select()
    .from(webhooks)
    .where(and(eq(webhooks.userId, userId), eq(webhooks.isActive, true)));

  const matchingWebhooks = userWebhooks.filter((wh) =>
    wh.events.includes(event)
  );

  const payload = JSON.stringify({
    event,
    timestamp: new Date().toISOString(),
    data,
  });

  for (const wh of matchingWebhooks) {
    const [delivery] = await db
      .insert(webhookDeliveries)
      .values({
        webhookId: wh.id,
        event,
        payload: { event, timestamp: new Date().toISOString(), data },
        status: "pending",
        attempts: 0,
      })
      .returning();

    await attemptDelivery(wh.url, wh.secret, payload, delivery.id);
  }
}

async function attemptDelivery(
  url: string,
  secret: string,
  payload: string,
  deliveryId: string
) {
  const signature = `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-paylix-signature": signature,
        "User-Agent": "Paylix-Webhook/1.0",
      },
      body: payload,
      signal: AbortSignal.timeout(10000),
    });

    await db
      .update(webhookDeliveries)
      .set({
        status: response.ok ? "delivered" : "failed",
        httpStatus: response.status,
        attempts: 1,
        nextRetryAt: response.ok ? null : getNextRetryTime(1),
      })
      .where(eq(webhookDeliveries.id, deliveryId));
  } catch (error) {
    await db
      .update(webhookDeliveries)
      .set({
        status: "failed",
        attempts: 1,
        nextRetryAt: getNextRetryTime(1),
      })
      .where(eq(webhookDeliveries.id, deliveryId));
  }
}

function getNextRetryTime(attempt: number): Date {
  const delays = [60, 300, 1800, 7200, 43200];
  const delaySec = delays[Math.min(attempt - 1, delays.length - 1)];
  return new Date(Date.now() + delaySec * 1000);
}
