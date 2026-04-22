import type { Metadata } from "next";
import {
  Callout,
  CodeBlock,
  PageHeading,
  SectionHeading,
  SubsectionHeading,
} from "@/components/docs";

export const metadata: Metadata = { title: "Refunds" };

export default function RefundsPage() {
  return (
    <>
      <PageHeading
        title="Refunds"
        description="Return USDC to a buyer and record the refund on the payment. Paylix is non-custodial — the merchant's own wallet sends the funds, and Paylix verifies the transfer on-chain before logging it."
      />

      <Callout variant="warning" title="Merchant covers the platform fee">
        Paylix does <strong>not</strong> refund the 0.5% platform fee paid
        on the original charge. A full $100 refund means the merchant
        sends $100 from their wallet — they absorb the $0.50 fee they
        already paid.
      </Callout>

      <SectionHeading>How it works</SectionHeading>
      <ol className="ml-5 list-decimal space-y-2 text-sm leading-relaxed text-foreground-muted">
        <li>
          Merchant initiates a USDC transfer from the wallet that
          originally received the payment (<code>toAddress</code> on the
          payment row) to the original buyer (<code>fromAddress</code>).
          Any wallet tool works — MetaMask, Safe, a script, etc.
        </li>
        <li>
          Merchant opens{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
            /dashboard/payments
          </code>
          , clicks the row&apos;s menu → <strong>Refund</strong>, fills
          the amount, pastes the tx hash, and confirms.
        </li>
        <li>
          Paylix fetches the receipt via RPC, decodes ERC20 Transfer
          logs, and verifies the merchant → buyer transfer is present
          for at least the refund amount in USDC.
        </li>
        <li>
          On success, Paylix inserts a refund row, increments{" "}
          <code>payments.refunded_cents</code>, and fires{" "}
          <code>payment.refunded</code>.
        </li>
      </ol>

      <SectionHeading>SDK</SectionHeading>
      <CodeBlock language="ts">{`await paylix.refundPayment({
  paymentId: "pay_abc",
  amount: 1000,          // integer cents
  txHash: "0x…",         // merchant → buyer USDC transfer
  reason: "Customer requested refund",
});`}</CodeBlock>

      <SectionHeading>Validation</SectionHeading>
      <ul className="ml-5 list-disc space-y-1.5 text-sm leading-relaxed text-foreground-muted">
        <li>
          Tx receipt must have <code>status: "success"</code>.
        </li>
        <li>
          At least one <code>Transfer</code> log on USDC, from{" "}
          <code>payment.toAddress</code>, to <code>payment.fromAddress</code>,
          for a value {">="} the refund amount in base units.
        </li>
        <li>
          Cumulative refunds cannot exceed the original payment amount.
        </li>
        <li>
          Tx hash is globally unique across the refund ledger — the same
          transfer cannot be used for two refund rows.
        </li>
      </ul>

      <SectionHeading>Webhook</SectionHeading>
      <CodeBlock language="json">{`{
  "event": "payment.refunded",
  "timestamp": "2026-04-22T14:00:00.000Z",
  "data": {
    "paymentId": "pay_abc",
    "refundId": "rfd_xyz",
    "amount": 1000,
    "reason": "Customer requested refund",
    "txHash": "0x…",
    "metadata": { "orderId": "42" }
  }
}`}</CodeBlock>

      <SubsectionHeading>Partial refunds</SubsectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Submit a smaller <code>amount</code> to refund part of the
        payment. Subsequent refunds on the same payment can reclaim the
        remainder up to the original charge. Each partial refund records
        its own row.
      </p>
    </>
  );
}
