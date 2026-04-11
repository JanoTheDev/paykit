import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { invoices, payments } from "@paylix/db/schema";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReceiptPdfDocument } from "@/components/invoice/receipt-pdf-document";
import { NETWORK } from "@/lib/chain";

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

  const [payment] = await db
    .select({
      txHash: payments.txHash,
      fromAddress: payments.fromAddress,
      toAddress: payments.toAddress,
      chain: payments.chain,
      token: payments.token,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .where(eq(payments.id, invoice.paymentId))
    .limit(1);

  if (!payment) {
    return new Response("Payment not found", { status: 404 });
  }

  const buffer = await renderToBuffer(
    ReceiptPdfDocument({
      invoice,
      payment,
      blockExplorer: NETWORK.blockExplorer,
    }),
  );

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="receipt-${invoice.number}.pdf"`,
      "Cache-Control": "private, max-age=60",
    },
  });
}
