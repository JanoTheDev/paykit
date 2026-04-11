import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import type { Invoice } from "@paylix/db/schema";

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 10, fontFamily: "Helvetica", color: "#0b0b0f" },
  eyebrow: { fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#6b7280" },
  title: { fontSize: 22, marginTop: 6, marginBottom: 4 },
  amount: { fontSize: 28, marginTop: 24, marginBottom: 4 },
  amountCaption: { fontSize: 9, color: "#6b7280", marginBottom: 28 },
  section: { marginTop: 18 },
  sectionLabel: { fontSize: 8, textTransform: "uppercase", letterSpacing: 1, color: "#6b7280", marginBottom: 3 },
  sectionValue: { fontSize: 11 },
  sectionValueMono: { fontSize: 9, fontFamily: "Courier" },
  divider: { borderTop: "1pt solid #e5e7eb", marginVertical: 24 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  rowLabel: { fontSize: 9, color: "#6b7280" },
  rowValue: { fontSize: 10 },
  link: { color: "#06d6a0", textDecoration: "none" },
  footer: { position: "absolute", bottom: 40, left: 48, right: 48, fontSize: 8, color: "#9ca3af", textAlign: "center" },
});

function money(cents: number, currency: string) {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

function truncate(addr: string | null, head = 6, tail = 4) {
  if (!addr) return "—";
  if (addr.length <= head + tail + 2) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

interface PaymentInfo {
  txHash: string | null;
  fromAddress: string | null;
  toAddress: string | null;
  chain: string;
  token: string;
  createdAt: Date;
}

interface Props {
  invoice: Invoice;
  payment: PaymentInfo;
  blockExplorer: string;
}

export function ReceiptPdfDocument({ invoice, payment, blockExplorer }: Props) {
  const txUrl = payment.txHash ? `${blockExplorer}/tx/${payment.txHash}` : null;
  const paidOn = new Date(payment.createdAt).toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Receipt</Text>
        <Text style={styles.title}>{invoice.merchantLegalName || "Payment receipt"}</Text>

        <Text style={styles.amount}>{money(invoice.totalCents, invoice.currency)}</Text>
        <Text style={styles.amountCaption}>Paid on {paidOn}</Text>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Invoice number</Text>
          <Text style={styles.rowValue}>{invoice.number}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Amount paid</Text>
          <Text style={styles.rowValue}>{money(invoice.totalCents, invoice.currency)}</Text>
        </View>
        {invoice.taxLabel && (
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{invoice.taxLabel}</Text>
            <Text style={styles.rowValue}>{money(invoice.taxCents, invoice.currency)}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Network</Text>
          <Text style={styles.rowValue}>{payment.chain} · {payment.token}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Paid by</Text>
          <Text style={styles.sectionValue}>{invoice.customerName || invoice.customerEmail || "Customer"}</Text>
          {payment.fromAddress && (
            <Text style={styles.sectionValueMono}>{truncate(payment.fromAddress)}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Paid to</Text>
          <Text style={styles.sectionValue}>{invoice.merchantLegalName || "Merchant"}</Text>
          {payment.toAddress && (
            <Text style={styles.sectionValueMono}>{truncate(payment.toAddress)}</Text>
          )}
        </View>

        {payment.txHash && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Transaction hash</Text>
            {txUrl ? (
              <Link src={txUrl} style={[styles.sectionValueMono, styles.link]}>
                {payment.txHash}
              </Link>
            ) : (
              <Text style={styles.sectionValueMono}>{payment.txHash}</Text>
            )}
          </View>
        )}

        <Text style={styles.footer}>
          This receipt confirms an on-chain payment. Verify the transaction hash on a block explorer for independent proof of settlement.
        </Text>
      </Page>
    </Document>
  );
}
