"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  PageShell,
  PageHeader,
  Section,
  DataTable,
  EmptyState,
  StatusBadge,
  ConfirmDialog,
  col,
} from "@/components/paykit";

export interface PortalSubscription {
  id: string;
  status: string;
  nextChargeDate: string | null;
  onChainId: string | null;
  productName: string;
  tokenSymbol: string;
  billingInterval: string | null;
  createdAt: string;
}

export interface PortalPayment {
  id: string;
  amount: number;
  status: string;
  txHash: string | null;
  token: string;
  productName: string;
  createdAt: string;
}

export interface PortalInvoice {
  id: string;
  number: string;
  totalCents: number;
  currency: string;
  issuedAt: string;
  hostedToken: string;
}

interface PortalClientProps {
  customerLabel: string;
  customerId: string;
  portalToken: string;
  subscriptions: PortalSubscription[];
  payments: PortalPayment[];
  invoices: PortalInvoice[];
}

type PortalPaymentRow = {
  id: string;
  createdAt: Date;
  productName: string;
  amount: number;
  status: string;
  txHash: string | null;
};

const paymentColumns = [
  col.date<PortalPaymentRow>("createdAt", "Date"),
  col.text<PortalPaymentRow>("productName", "Product"),
  col.amount<PortalPaymentRow>("amount", "Amount", { withBadge: true }),
  col.status<PortalPaymentRow>("status", "Status", "payment"),
  col.hash<PortalPaymentRow>("txHash", "Tx"),
];

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMoney(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

export function PortalClient({
  customerLabel,
  customerId,
  portalToken,
  subscriptions,
  payments,
  invoices,
}: PortalClientProps) {
  const router = useRouter();
  const [cancelTarget, setCancelTarget] = useState<PortalSubscription | null>(
    null,
  );

  async function handleConfirmed() {
    // Trigger the server-component refresh and hold the dialog's "Working..."
    // state until the new data has had time to render. The cancel route already
    // waits for the on-chain receipt before returning, so by this point the DB
    // is settled — the small delay just covers the refresh round-trip so the
    // dialog doesn't close while the row still visually says "active".
    router.refresh();
    await new Promise((resolve) => setTimeout(resolve, 600));
  }

  const paymentRows: PortalPaymentRow[] = payments.map((p) => ({
    id: p.id,
    createdAt: new Date(p.createdAt),
    productName: p.productName,
    amount: p.amount,
    status: p.status,
    txHash: p.txHash,
  }));

  return (
    <PageShell size="sm">
      <PageHeader
        title="Your Subscriptions & Payments"
        description={`Signed in as ${customerLabel}`}
      />

      <Section title="Subscriptions">
        {subscriptions.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface-1">
            <EmptyState
              title="No subscriptions yet"
              description="You don't have any active subscriptions."
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {subscriptions.map((sub) => {
              const canCancel =
                sub.status === "active" || sub.status === "past_due";
              return (
                <div
                  key={sub.id}
                  className="flex flex-col gap-4 rounded-lg border border-border bg-surface-1 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-base font-semibold">
                        {sub.productName}
                      </h3>
                      <StatusBadge
                        kind="subscription"
                        status={
                          sub.status as
                            | "active"
                            | "past_due"
                            | "cancelled"
                            | "expired"
                            | "incomplete"
                        }
                      />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-foreground-muted">
                      <span>
                        Next charge:{" "}
                        <span className="text-foreground">
                          {canCancel ? formatDate(sub.nextChargeDate) : "—"}
                        </span>
                      </span>
                      {sub.billingInterval && (
                        <span className="capitalize">
                          {sub.billingInterval}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                    <span className="text-xs font-mono text-foreground-muted">{sub.tokenSymbol}</span>
                    {canCancel && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setCancelTarget(sub)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <Section title="Payment history">
        <DataTable
          columns={paymentColumns}
          data={paymentRows}
          emptyState={
            <EmptyState
              title="No payments yet"
              description="Your payment history will appear here."
            />
          }
        />
      </Section>

      <Section title="Invoices">
        {invoices.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface-1 px-5 py-4 text-sm text-foreground-muted">
            No invoices yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-surface-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-foreground-muted">
                  <th className="px-4 py-3 font-medium">Number</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                  <th className="px-4 py-3 font-medium">Issued</th>
                  <th className="px-4 py-3 font-medium text-right">PDF</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 font-mono text-foreground">
                      {inv.number}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">
                      {formatMoney(inv.totalCents, inv.currency)}
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {formatDate(inv.issuedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={`/i/${inv.hostedToken}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <ConfirmDialog
        open={cancelTarget !== null}
        onOpenChange={(v) => !v && setCancelTarget(null)}
        title="Cancel subscription?"
        description={
          cancelTarget
            ? `Cancel "${cancelTarget.productName}"? You will not be charged further.`
            : "Cancel this subscription?"
        }
        confirmLabel="Cancel subscription"
        variant="destructive"
        onConfirm={async () => {
          if (!cancelTarget) return;
          const res = await fetch("/api/portal/cancel-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subscriptionId: cancelTarget.id,
              customerId,
              token: portalToken,
            }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "Cancel failed");
          }
          await handleConfirmed();
        }}
      />
    </PageShell>
  );
}
