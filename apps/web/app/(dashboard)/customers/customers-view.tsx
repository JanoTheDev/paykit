"use client";

import {
  PageShell,
  PageHeader,
  DataTable,
  EmptyState,
  col,
} from "@/components/paykit";
import PortalLinkButton from "./portal-link-button";

export type CustomerRow = {
  id: string;
  name: string;
  email: string | null;
  walletAddress: string | null;
  totalSpent: number;
  paymentCount: number;
  lastPayment: Date | null;
};

const columns = [
  col.text<CustomerRow>("name", "Name"),
  col.text<CustomerRow>("email", "Email"),
  col.address<CustomerRow>("walletAddress", "Wallet"),
  col.amount<CustomerRow>("totalSpent", "Total Spent"),
  col.text<CustomerRow>("paymentCount", "Payments", { align: "right" }),
  col.date<CustomerRow>("lastPayment", "Last Payment"),
  col.actions<CustomerRow>((row) => <PortalLinkButton customerUuid={row.id} />),
];

interface CustomersViewProps {
  rows: CustomerRow[];
}

export default function CustomersView({ rows }: CustomersViewProps) {
  return (
    <PageShell>
      <PageHeader
        title="Customers"
        description="People who have paid you at least once."
      />
      <DataTable
        columns={columns}
        data={rows}
        emptyState={
          <EmptyState
            title="No customers yet"
            description="Once someone pays you, they'll appear here."
          />
        }
      />
    </PageShell>
  );
}
