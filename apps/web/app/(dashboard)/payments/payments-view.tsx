"use client";

import {
  PageShell,
  PageHeader,
  DataTable,
  EmptyState,
  col,
} from "@/components/paykit";

export type PaymentRow = {
  id: string;
  amount: number;
  fee: number;
  status: string;
  txHash: string | null;
  createdAt: Date;
  productName: string | null;
  productType: string | null;
  customerEmail: string | null;
  customerWallet: string | null;
  invoiceNumber: string | null;
  invoiceHostedToken: string | null;
};

const columns = [
  col.date<PaymentRow>("createdAt", "Date"),
  col.text<PaymentRow>("productName", "Product"),
  col.status<PaymentRow>("productType", "Type", "productType"),
  col.customer<PaymentRow>({
    emailKey: "customerEmail",
    walletKey: "customerWallet",
  }),
  col.amount<PaymentRow>("amount", "Amount", { withBadge: true }),
  col.amount<PaymentRow>("fee", "Fee"),
  col.status<PaymentRow>("status", "Status", "payment"),
  col.hash<PaymentRow>("txHash", "Tx Hash"),
  col.actions<PaymentRow>((row) =>
    row.invoiceHostedToken ? (
      <a
        href={`/i/${row.invoiceHostedToken}/pdf`}
        className="text-accent underline-offset-2 hover:underline"
        title={row.invoiceNumber ?? "Invoice"}
      >
        Invoice
      </a>
    ) : (
      <span className="text-foreground-dim">—</span>
    ),
  ),
];

interface PaymentsViewProps {
  rows: PaymentRow[];
}

export default function PaymentsView({ rows }: PaymentsViewProps) {
  return (
    <PageShell>
      <PageHeader
        title="Payments"
        description="All payments received by your account."
      />
      <DataTable
        columns={columns}
        data={rows}
        emptyState={
          <EmptyState
            title="No payments yet"
            description="Once a customer pays through a checkout link or subscription, you'll see it here."
          />
        }
      />
    </PageShell>
  );
}
