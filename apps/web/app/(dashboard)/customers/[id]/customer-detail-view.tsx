"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PageShell,
  PageHeader,
  Section,
  DataTable,
  EmptyState,
  KeyValueList,
  CopyableField,
  AddressText,
  col,
} from "@/components/paykit";

type CustomerPaymentRow = {
  id: string;
  amount: number;
  fee: number;
  status: string;
  txHash: string | null;
  createdAt: Date;
  productName: string | null;
};

type CustomerSubscriptionRow = {
  id: string;
  status: string;
  createdAt: Date;
  nextChargeDate: Date | null;
  productName: string | null;
};

const paymentColumns = [
  col.date<CustomerPaymentRow>("createdAt", "Date"),
  col.text<CustomerPaymentRow>("productName", "Product"),
  col.amount<CustomerPaymentRow>("amount", "Amount", { withBadge: true }),
  col.amount<CustomerPaymentRow>("fee", "Fee"),
  col.status<CustomerPaymentRow>("status", "Status", "payment"),
  col.hash<CustomerPaymentRow>("txHash", "Tx Hash"),
];

const subscriptionColumns = [
  col.text<CustomerSubscriptionRow>("productName", "Plan"),
  col.status<CustomerSubscriptionRow>("status", "Status", "subscription"),
  col.date<CustomerSubscriptionRow>("createdAt", "Started"),
  col.date<CustomerSubscriptionRow>("nextChargeDate", "Next Charge"),
];

interface CustomerDetailViewProps {
  customer: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    walletAddress: string | null;
  };
  metadata: Record<string, string> | null;
  payments: CustomerPaymentRow[];
  subscriptions: CustomerSubscriptionRow[];
}

export default function CustomerDetailView({
  customer,
  metadata,
  payments,
  subscriptions,
}: CustomerDetailViewProps) {
  const infoItems = [
    { label: "Name", value: customer.name ?? "—" },
    { label: "Email", value: customer.email ?? "—" },
    { label: "Phone", value: customer.phone ?? "—" },
    {
      label: "Wallet",
      value: customer.walletAddress ? (
        <AddressText address={customer.walletAddress} link />
      ) : (
        "—"
      ),
    },
  ];

  return (
    <PageShell>
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/customers">
            <ArrowLeft size={16} />
            Back to Customers
          </Link>
        </Button>
      </div>

      <PageHeader title={customer.name ?? "Customer"} />

      <Section title="Details">
        <div className="rounded-lg border border-border bg-surface-1 p-6">
          <KeyValueList items={infoItems} />
          {customer.walletAddress && (
            <div className="mt-6">
              <CopyableField
                label="Wallet Address"
                value={customer.walletAddress}
              />
            </div>
          )}
          {metadata && Object.keys(metadata).length > 0 && (
            <div className="mt-6">
              <div className="mb-2 text-xs font-medium uppercase tracking-wider text-foreground-dim">
                Metadata
              </div>
              <div className="flex flex-col gap-1">
                {Object.entries(metadata).map(([key, value]) => (
                  <div key={key} className="font-mono text-xs">
                    <span className="text-foreground-dim">{key}</span>
                    <span className="mx-2 text-foreground-dim">=</span>
                    <span className="text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      <Section title="Payments">
        <DataTable
          columns={paymentColumns}
          data={payments}
          emptyState={
            <EmptyState
              title="No payments yet"
              description="This customer hasn't paid you yet."
            />
          }
        />
      </Section>

      <Section title="Subscriptions">
        <DataTable
          columns={subscriptionColumns}
          data={subscriptions}
          emptyState={
            <EmptyState
              title="No subscriptions"
              description="This customer has no active or past subscriptions."
            />
          }
        />
      </Section>
    </PageShell>
  );
}
