import { db } from "@/lib/db";
import {
  customers,
  subscriptions,
  payments,
  products,
} from "@paylix/db/schema";
import { eq, desc } from "drizzle-orm";
import { Web3Providers } from "@/components/providers";
import { PortalClient, type PortalSubscription, type PortalPayment } from "./portal-client";
import { verifyPortalToken } from "@/lib/portal-tokens";

interface PortalPageProps {
  // Note: this is the customers.id (UUID), not the developer-provided
  // customers.customerId string. UUIDs are globally unique so this makes
  // portal links unambiguous.
  params: Promise<{ customerId: string }>;
  searchParams: Promise<{ token?: string }>;
}

function PortalError({ title, message }: { title: string; message: string }) {
  return (
    <div className="mx-auto max-w-[480px] rounded-xl border border-[rgba(148,163,184,0.12)] bg-[#111116] p-8 text-center">
      <h1 className="mb-2 text-[20px] font-semibold tracking-[-0.4px] text-[#f0f0f3]">
        {title}
      </h1>
      <p className="text-[14px] leading-[1.55] text-[#94a3b8]">{message}</p>
    </div>
  );
}

export default async function PortalPage({ params, searchParams }: PortalPageProps) {
  const { customerId } = await params;
  const { token } = await searchParams;

  if (!token || !verifyPortalToken(token, customerId)) {
    return (
      <PortalError
        title="Portal link expired"
        message="This portal link is invalid or has expired. Please ask the merchant for a new link."
      />
    );
  }

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, customerId));

  if (!customer) {
    return (
      <PortalError
        title="Customer not found"
        message="This portal link is invalid or the customer no longer exists."
      />
    );
  }

  const subRows = await db
    .select({
      id: subscriptions.id,
      status: subscriptions.status,
      nextChargeDate: subscriptions.nextChargeDate,
      onChainId: subscriptions.onChainId,
      createdAt: subscriptions.createdAt,
      productName: products.name,
      productPrice: products.price,
      productCurrency: products.currency,
      billingInterval: products.billingInterval,
    })
    .from(subscriptions)
    .innerJoin(products, eq(subscriptions.productId, products.id))
    .where(eq(subscriptions.customerId, customer.id))
    .orderBy(desc(subscriptions.createdAt));

  const payRows = await db
    .select({
      id: payments.id,
      amount: payments.amount,
      status: payments.status,
      txHash: payments.txHash,
      token: payments.token,
      createdAt: payments.createdAt,
      productName: products.name,
    })
    .from(payments)
    .innerJoin(products, eq(payments.productId, products.id))
    .where(eq(payments.customerId, customer.id))
    .orderBy(desc(payments.createdAt))
    .limit(50);

  const portalSubs: PortalSubscription[] = subRows.map((r) => ({
    id: r.id,
    status: r.status,
    nextChargeDate: r.nextChargeDate ? r.nextChargeDate.toISOString() : null,
    onChainId: r.onChainId,
    productName: r.productName,
    productPrice: r.productPrice,
    productCurrency: r.productCurrency,
    billingInterval: r.billingInterval,
    createdAt: r.createdAt.toISOString(),
  }));

  const portalPayments: PortalPayment[] = payRows.map((r) => ({
    id: r.id,
    amount: r.amount,
    status: r.status,
    txHash: r.txHash,
    token: r.token,
    productName: r.productName,
    createdAt: r.createdAt.toISOString(),
  }));

  const customerLabel =
    [customer.firstName, customer.lastName].filter(Boolean).join(" ") ||
    customer.email ||
    "your account";

  return (
    <Web3Providers>
      <PortalClient
        customerLabel={customerLabel}
        subscriptions={portalSubs}
        payments={portalPayments}
      />
    </Web3Providers>
  );
}
