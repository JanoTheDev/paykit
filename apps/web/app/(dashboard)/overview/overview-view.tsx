"use client";

import Link from "next/link";
import { formatAmount } from "@/lib/format";
import {
  PageShell,
  PageHeader,
  MetricGrid,
  MetricCard,
  Section,
  DataTable,
  EmptyState,
  col,
} from "@/components/paykit";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { SubscriptionsChart } from "@/components/charts/subscriptions-chart";

type RecentPayment = {
  id: string;
  amount: number;
  status: string;
  txHash: string | null;
  createdAt: Date;
};

const recentColumns = [
  col.amount<RecentPayment>("amount", "Amount", { withBadge: true }),
  col.status<RecentPayment>("status", "Status", "payment"),
  col.hash<RecentPayment>("txHash", "Tx Hash"),
  col.date<RecentPayment>("createdAt", "Date"),
];

interface OverviewViewProps {
  totalRevenue: number;
  revenue30d: number;
  paymentCount: number;
  activeSubs: number;
  activeTrials: number;
  convertingSoon: number;
  recentPayments: RecentPayment[];
  revenueByDay: Array<{ date: string; total: number }>;
  subsGrowth: Array<{ date: string; cumulative: number }>;
}

export default function OverviewView({
  totalRevenue,
  revenue30d,
  paymentCount,
  activeSubs,
  activeTrials,
  convertingSoon,
  recentPayments,
  revenueByDay,
  subsGrowth,
}: OverviewViewProps) {
  return (
    <PageShell>
      <PageHeader title="Overview" />

      <MetricGrid>
        <MetricCard label="Total Revenue" value={formatAmount(totalRevenue)} />
        <MetricCard label="Revenue (30d)" value={formatAmount(revenue30d)} />
        <MetricCard
          label="Total Payments"
          value={paymentCount.toLocaleString()}
        />
        <MetricCard
          label="Active Subscribers"
          value={activeSubs.toLocaleString()}
        />
        <MetricCard
          label="Active Trials"
          value={activeTrials.toLocaleString()}
          hint={`${convertingSoon.toLocaleString()} converting in next 7 days`}
        />
      </MetricGrid>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueChart data={revenueByDay} />
        <SubscriptionsChart data={subsGrowth} />
      </div>

      <Section
        title="Recent Payments"
        action={
          <Link
            href="/payments"
            className="text-sm text-foreground-muted transition-colors hover:text-foreground"
          >
            View all →
          </Link>
        }
      >
        <DataTable
          columns={recentColumns}
          data={recentPayments}
          emptyState={
            <EmptyState
              title="No payments yet"
              description="Payments will appear here as they come in."
            />
          }
        />
      </Section>
    </PageShell>
  );
}
