import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { invoices, invoiceLineItems } from "@paylix/db/schema";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePdfDocument } from "@/components/invoice/pdf-document";
import { createElement } from "react";

interface Ctx {
  params: Promise<{ token: string }>;
}

export async function GET(_req: Request, ctx: Ctx) {
  const { token } = await ctx.params;
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(eq(invoices.hostedToken, token))
    .limit(1);
  if (!invoice) {
    return new Response("Not found", { status: 404 });
  }
  const lineItems = await db
    .select()
    .from(invoiceLineItems)
    .where(eq(invoiceLineItems.invoiceId, invoice.id));

  const buffer = await renderToBuffer(
    createElement(InvoicePdfDocument, { invoice, lineItems }),
  );

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.number}.pdf"`,
      "Cache-Control": "private, max-age=60",
    },
  });
}
