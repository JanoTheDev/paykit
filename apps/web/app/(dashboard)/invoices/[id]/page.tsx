import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { invoices, invoiceLineItems } from "@paylix/db/schema";
import { HostedInvoice } from "@/components/invoice/hosted-invoice";
import { PageShell, PageHeader } from "@/components/paykit";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const { id } = await params;

  const [invoice] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, id), eq(invoices.merchantId, session.user.id)))
    .limit(1);
  if (!invoice) notFound();

  const lineItems = await db
    .select()
    .from(invoiceLineItems)
    .where(eq(invoiceLineItems.invoiceId, invoice.id));

  return (
    <PageShell>
      <PageHeader title={`Invoice ${invoice.number}`} />
      <HostedInvoice
        invoice={invoice}
        lineItems={lineItems}
        downloadHref={`/i/${invoice.hostedToken}/pdf`}
      />
    </PageShell>
  );
}
