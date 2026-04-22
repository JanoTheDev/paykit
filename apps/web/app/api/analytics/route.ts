import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { payments, subscriptions, productPrices } from "@paylix/db/schema";
import { and, eq, gte, lte, inArray } from "drizzle-orm";
import { resolveActiveOrg } from "@/lib/require-active-org";
import { orgScope } from "@/lib/org-scope";
import {
  aggregateActiveSubsByDay,
  aggregateFailedRateByDay,
  aggregateMrrByDay,
  aggregateRevenueByDay,
  arpuCents,
} from "@/lib/analytics";

const VALID_RANGES = [7, 30, 90] as const;

export async function GET(request: Request) {
  const ctx = await resolveActiveOrg();
  if (!ctx.ok) return ctx.response;
  const { organizationId, livemode } = ctx;

  const url = new URL(request.url);
  const rangeParam = Number.parseInt(url.searchParams.get("range") ?? "30", 10);
  const rangeDays = (
    VALID_RANGES.find((r) => r === rangeParam) ?? 30
  ) as number;

  const now = new Date();
  const endUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const startUtc = new Date(endUtc);
  startUtc.setUTCDate(startUtc.getUTCDate() - (rangeDays - 1));

  const paymentRows = await db
    .select({
      amount: payments.amount,
      status: payments.status,
      customerId: payments.customerId,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .where(
      and(
        orgScope(payments, { organizationId, livemode }),
        gte(payments.createdAt, startUtc),
        lte(payments.createdAt, new Date(endUtc.getTime() + 24 * 60 * 60 * 1000 - 1)),
      ),
    );

  // MRR / active subs need ALL subs whose lifecycle overlaps the window —
  // active today includes subs created long ago. So we don't range-filter
  // on createdAt here. Org+livemode + non-trial statuses is enough.
  //
  // amountCents is derived from product_prices. We join on
  // (productId, networkKey, tokenSymbol) and assume USDC-6-decimals for v1
  // (dividing native units by 10_000 → cents). Non-USDC tokens will need
  // per-token decimal-aware scaling when multi-token analytics lands.
  const subRowsRaw = await db
    .select({
      status: subscriptions.status,
      intervalSeconds: subscriptions.intervalSeconds,
      priceAmount: productPrices.amount,
      createdAt: subscriptions.createdAt,
      updatedAt: subscriptions.updatedAt,
      subStatus: subscriptions.status,
    })
    .from(subscriptions)
    .leftJoin(
      productPrices,
      and(
        eq(productPrices.productId, subscriptions.productId),
        eq(productPrices.networkKey, subscriptions.networkKey),
        eq(productPrices.tokenSymbol, subscriptions.tokenSymbol),
      ),
    )
    .where(
      and(
        orgScope(subscriptions, { organizationId, livemode }),
        inArray(subscriptions.status, [
          "active",
          "past_due",
          "paused",
          "cancelled",
          "trialing",
          "trial_conversion_failed",
        ]),
      ),
    );

  const subRows = subRowsRaw.map((r) => ({
    status: r.status,
    intervalSeconds: r.intervalSeconds,
    amountCents: r.priceAmount ? Number(r.priceAmount) / 10_000 : 0,
    createdAt: r.createdAt,
    cancelledAt: r.subStatus === "cancelled" ? r.updatedAt : null,
  }));

  const revenueByDay = aggregateRevenueByDay(paymentRows, startUtc, endUtc);
  const failedRateByDay = aggregateFailedRateByDay(paymentRows, startUtc, endUtc);
  const mrrByDay = aggregateMrrByDay(subRows, startUtc, endUtc);
  const activeSubsByDay = aggregateActiveSubsByDay(subRows, startUtc, endUtc);
  const arpu = arpuCents(
    paymentRows.map((p) => ({
      amount: p.amount,
      status: p.status,
      customerId: p.customerId,
    })),
  );

  return NextResponse.json(
    {
      range: rangeDays,
      start: startUtc.toISOString(),
      end: endUtc.toISOString(),
      revenueByDay,
      mrrByDay,
      activeSubsByDay,
      failedRateByDay,
      arpuCents: arpu,
    },
    {
      headers: {
        "Cache-Control": "private, max-age=300",
      },
    },
  );
}
