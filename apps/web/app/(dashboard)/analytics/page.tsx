"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PageShell,
  PageHeader,
  MetricGrid,
  MetricCard,
} from "@/components/paykit";
import { Button } from "@/components/ui/button";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { MrrChart } from "@/components/charts/mrr-chart";
import { FailedRateChart } from "@/components/charts/failed-rate-chart";
import { SubscriptionsChart } from "@/components/charts/subscriptions-chart";
import { formatAmount } from "@/lib/format";

type Range = 7 | 30 | 90;

interface AnalyticsPayload {
  range: number;
  start: string;
  end: string;
  revenueByDay: Array<{ date: string; value: number }>;
  mrrByDay: Array<{ date: string; value: number }>;
  activeSubsByDay: Array<{ date: string; value: number }>;
  failedRateByDay: Array<{
    date: string;
    value: { rate: number; failed: number; attempted: number };
  }>;
  arpuCents: number;
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>(30);
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (r: Range) => {
    setLoading(true);
    const res = await fetch(`/api/analytics?range=${r}`, { cache: "no-store" });
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData(range);
  }, [fetchData, range]);

  const latestMrr = data?.mrrByDay[data.mrrByDay.length - 1]?.value ?? 0;
  const windowRevenue =
    data?.revenueByDay.reduce((acc, b) => acc + b.value, 0) ?? 0;
  const latestActive =
    data?.activeSubsByDay[data.activeSubsByDay.length - 1]?.value ?? 0;
  const latestFailedRate =
    data?.failedRateByDay[data.failedRateByDay.length - 1]?.value ?? {
      rate: 0,
      failed: 0,
      attempted: 0,
    };

  const rangeButtons: Range[] = [7, 30, 90];

  return (
    <PageShell>
      <PageHeader
        title="Analytics"
        description="Revenue, MRR, subscriber counts, and failed-charge rate."
        action={
          <div className="flex gap-1 rounded-md border border-border bg-surface-1 p-1">
            {rangeButtons.map((r) => (
              <Button
                key={r}
                variant={range === r ? "default" : "ghost"}
                size="sm"
                onClick={() => setRange(r)}
              >
                {r}d
              </Button>
            ))}
          </div>
        }
      />

      <MetricGrid>
        <MetricCard label="MRR" value={formatAmount(latestMrr)} hint="latest day" />
        <MetricCard
          label={`Revenue (${range}d)`}
          value={formatAmount(windowRevenue)}
        />
        <MetricCard
          label="Active subscribers"
          value={latestActive.toLocaleString()}
        />
        <MetricCard
          label="ARPU"
          value={formatAmount(data?.arpuCents ?? 0)}
          hint={`${range}d window`}
        />
        <MetricCard
          label="Failed rate"
          value={`${(latestFailedRate.rate * 100).toFixed(1)}%`}
          hint={`${latestFailedRate.failed} / ${latestFailedRate.attempted}`}
        />
      </MetricGrid>

      {loading && !data ? (
        <div className="rounded-lg border border-border bg-surface-1 py-16 text-center text-sm text-foreground-muted">
          Loading…
        </div>
      ) : data ? (
        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <MrrChart data={data.mrrByDay} />
          <RevenueChart
            data={data.revenueByDay.map((b) => ({
              date: b.date,
              total: b.value / 100,
            }))}
          />
          <SubscriptionsChart
            data={data.activeSubsByDay.map((b) => ({
              date: b.date,
              cumulative: b.value,
            }))}
          />
          <FailedRateChart data={data.failedRateByDay} />
        </div>
      ) : null}
    </PageShell>
  );
}
