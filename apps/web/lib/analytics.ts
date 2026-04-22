/**
 * Pure analytics aggregations. Input rows come straight from Drizzle
 * queries; output is time-series data suitable for feeding into Recharts.
 *
 * All monetary values are integer cents. No conversion here — the API
 * layer owns display formatting.
 */

export interface PaymentRow {
  amount: number;
  status: "pending" | "confirmed" | "failed";
  createdAt: Date;
}

export interface SubscriptionRow {
  status:
    | "trialing"
    | "active"
    | "past_due"
    | "paused"
    | "cancelled"
    | "trial_conversion_failed"
    | "expired";
  intervalSeconds: number | null;
  amountCents: number;
  createdAt: Date;
  cancelledAt: Date | null;
}

export interface DayBucket<T> {
  date: string; // YYYY-MM-DD
  value: T;
}

export function formatDay(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function daysBetween(from: Date, to: Date): string[] {
  const out: string[] = [];
  const cursor = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()),
  );
  const end = new Date(
    Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()),
  );
  while (cursor.getTime() <= end.getTime()) {
    out.push(formatDay(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

export function aggregateRevenueByDay(
  rows: PaymentRow[],
  from: Date,
  to: Date,
): DayBucket<number>[] {
  const buckets = new Map<string, number>();
  for (const d of daysBetween(from, to)) buckets.set(d, 0);
  for (const row of rows) {
    if (row.status !== "confirmed") continue;
    const k = formatDay(row.createdAt);
    if (!buckets.has(k)) continue;
    buckets.set(k, (buckets.get(k) ?? 0) + row.amount);
  }
  return Array.from(buckets.entries()).map(([date, value]) => ({ date, value }));
}

export function aggregateFailedRateByDay(
  rows: PaymentRow[],
  from: Date,
  to: Date,
): DayBucket<{ rate: number; failed: number; attempted: number }>[] {
  const counts = new Map<string, { failed: number; attempted: number }>();
  for (const d of daysBetween(from, to)) counts.set(d, { failed: 0, attempted: 0 });
  for (const row of rows) {
    const k = formatDay(row.createdAt);
    const bucket = counts.get(k);
    if (!bucket) continue;
    if (row.status === "confirmed" || row.status === "failed") {
      bucket.attempted += 1;
      if (row.status === "failed") bucket.failed += 1;
    }
  }
  return Array.from(counts.entries()).map(([date, c]) => ({
    date,
    value: {
      rate: c.attempted === 0 ? 0 : c.failed / c.attempted,
      failed: c.failed,
      attempted: c.attempted,
    },
  }));
}

/**
 * Normalize a subscription's amount/interval into a monthly-recurring
 * figure in cents. Uses a fixed 30-day month. Non-recurring intervals
 * contribute zero.
 */
export function monthlyCents(row: Pick<SubscriptionRow, "amountCents" | "intervalSeconds">): number {
  if (!row.intervalSeconds || row.intervalSeconds <= 0) return 0;
  const monthSeconds = 30 * 24 * 60 * 60;
  // cents * (month / interval) — integer floor to avoid penny drift
  return Math.floor((row.amountCents * monthSeconds) / row.intervalSeconds);
}

/**
 * MRR on day D = sum of monthlyCents(sub) for subs that are active on D
 * (created on/before D and not cancelled before D).
 */
function wasActiveOnDay(row: SubscriptionRow, endOfDay: Date): boolean {
  // Include cancelled rows so historical days reflect the contribution
  // of subs that were active then, then dropped. The cancelledAt check
  // gates which days they count for.
  const eligibleStatus =
    row.status === "active" ||
    row.status === "past_due" ||
    row.status === "cancelled";
  if (!eligibleStatus) return false;
  if (row.createdAt.getTime() > endOfDay.getTime()) return false;
  if (row.cancelledAt && row.cancelledAt.getTime() <= endOfDay.getTime()) {
    return false;
  }
  return true;
}

export function aggregateMrrByDay(
  rows: SubscriptionRow[],
  from: Date,
  to: Date,
): DayBucket<number>[] {
  const out: DayBucket<number>[] = [];
  for (const day of daysBetween(from, to)) {
    const endOfDay = new Date(`${day}T23:59:59.999Z`);
    let sum = 0;
    for (const row of rows) {
      if (!wasActiveOnDay(row, endOfDay)) continue;
      sum += monthlyCents(row);
    }
    out.push({ date: day, value: sum });
  }
  return out;
}

export function aggregateActiveSubsByDay(
  rows: SubscriptionRow[],
  from: Date,
  to: Date,
): DayBucket<number>[] {
  const out: DayBucket<number>[] = [];
  for (const day of daysBetween(from, to)) {
    const endOfDay = new Date(`${day}T23:59:59.999Z`);
    let count = 0;
    for (const row of rows) {
      if (!wasActiveOnDay(row, endOfDay)) continue;
      count += 1;
    }
    out.push({ date: day, value: count });
  }
  return out;
}

/**
 * ARPU = revenue in the window / distinct paying customers in the window.
 * Takes payments + a parallel array of their customerIds so we stay
 * pure (no DB query inside).
 */
export function arpuCents(
  payments: Array<{ amount: number; status: PaymentRow["status"]; customerId: string }>,
): number {
  const customers = new Set<string>();
  let revenue = 0;
  for (const p of payments) {
    if (p.status !== "confirmed") continue;
    revenue += p.amount;
    customers.add(p.customerId);
  }
  if (customers.size === 0) return 0;
  return Math.floor(revenue / customers.size);
}
