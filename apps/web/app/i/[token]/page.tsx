import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { invoices, invoiceLineItems } from "@paylix/db/schema";
import { HostedInvoice } from "@/components/invoice/hosted-invoice";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function HostedInvoicePage({ params }: PageProps) {
  const { token } = await params;
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.hostedToken, token))
    .limit(1);
  if (!invoice) notFound();

  const lineItems = await db
    .select()
    .from(invoiceLineItems)
    .where(eq(invoiceLineItems.invoiceId, invoice.id));

  return (
    <HostedInvoice
      invoice={invoice}
      lineItems={lineItems}
      downloadHref={`/i/${token}/pdf`}
      receiptHref={`/i/${token}/receipt`}
    />
  );
}
