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
  Amount,
  col,
} from "@/components/paykit";
import CancelSubscriptionModal from "@/components/cancel-subscription-modal";

export interface PortalSubscription {
  id: string;
  status: string;
  nextChargeDate: string | null;
  onChainId: string | null;
  productName: string;
  productPrice: number;
  productCurrency: string;
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

interface PortalClientProps {
  customerLabel: string;
  subscriptions: PortalSubscription[];
  payments: PortalPayment[];
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

export function PortalClient({
  customerLabel,
  subscriptions,
  payments,
}: PortalClientProps) {
  const router = useRouter();
  const [cancelTarget, setCancelTarget] = useState<PortalSubscription | null>(
    null,
  );

  function handleConfirmed() {
    setTimeout(() => router.refresh(), 2500);
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
                    <Amount cents={sub.productPrice} withBadge />
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

      <CancelSubscriptionModal
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        onChainId={cancelTarget?.onChainId ?? null}
        productName={cancelTarget?.productName ?? null}
        onConfirmed={handleConfirmed}
        context="subscriber"
      />
    </PageShell>
  );
}
