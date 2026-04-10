"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  PageShell,
  PageHeader,
  DataTable,
  EmptyState,
  AddressText,
  col,
} from "@/components/paykit";
import CancelButton from "./cancel-button";

export type SubscriberRow = {
  id: string;
  status: string;
  createdAt: Date;
  nextChargeDate: Date | null;
  onChainId: string | null;
  productName: string | null;
  customerEmail: string | null;
  customerWallet: string | null;
};

const columns: ColumnDef<SubscriberRow, unknown>[] = [
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => {
      const { customerEmail, customerWallet } = row.original;
      if (customerEmail) return <span>{customerEmail}</span>;
      if (customerWallet) return <AddressText address={customerWallet} />;
      return <span className="text-foreground-dim">—</span>;
    },
  },
  col.text<SubscriberRow>("productName", "Plan"),
  col.status<SubscriberRow>("status", "Status", "subscription"),
  col.date<SubscriberRow>("createdAt", "Started"),
  col.date<SubscriberRow>("nextChargeDate", "Next Charge"),
  col.actions<SubscriberRow>((row) =>
    row.status === "active" || row.status === "past_due" ? (
      <CancelButton
        subscriptionId={row.id}
        onChainId={row.onChainId ?? null}
        productName={row.productName ?? null}
      />
    ) : null,
  ),
];

interface SubscribersViewProps {
  rows: SubscriberRow[];
}

export default function SubscribersView({ rows }: SubscribersViewProps) {
  return (
    <PageShell>
      <PageHeader
        title="Subscribers"
        description="Active and past recurring subscriptions. Cancelling requires signing an on-chain transaction with the merchant wallet."
      />
      <DataTable
        columns={columns}
        data={rows}
        emptyState={
          <EmptyState
            title="No subscribers yet"
            description="Subscriptions will appear here once customers sign up."
          />
        }
      />
    </PageShell>
  );
}
