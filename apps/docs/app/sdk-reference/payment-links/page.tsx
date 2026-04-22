import type { Metadata } from "next";
import {
  CodeBlock,
  DocTable,
  DocTableBody,
  DocTableHead,
  DocTableHeader,
  DocTableRow,
  PageHeading,
  ParamRow,
  SectionHeading,
  SubsectionHeading,
} from "@/components/docs";

export const metadata: Metadata = { title: "Payment Links — SDK Reference" };

export default function PaymentLinksReference() {
  return (
    <>
      <PageHeading
        title="Payment Links"
        description="Create, read, update, list, and archive reusable payment links. Every visit to a link spawns a fresh checkout_session."
      />

      <SectionHeading>paylix.createPaymentLink(params)</SectionHeading>
      <CodeBlock language="ts">{`const { link, url } = await paylix.createPaymentLink({
  productId: "prod_abc",
  name: "Twitter bio",
  // Optional pre-lock:
  // networkKey: "base-sepolia",
  // tokenSymbol: "USDC",
  // customerId: "cust_123",
  maxRedemptions: 100,
  metadata: { source: "twitter" },
});

console.log(url); // https://pay.example.com/pay/<linkId>`}</CodeBlock>

      <SubsectionHeading>PaymentLink</SubsectionHeading>
      <DocTable>
        <DocTableHead>
          <DocTableRow>
            <DocTableHeader>Field</DocTableHeader>
            <DocTableHeader>Type</DocTableHeader>
            <DocTableHeader>Description</DocTableHeader>
          </DocTableRow>
        </DocTableHead>
        <DocTableBody>
          <ParamRow name="id" type="string" description="Payment link ID." />
          <ParamRow name="productId" type="string" description="Product the link resolves against." />
          <ParamRow name="name" type="string" description="Internal label for merchant-side bookkeeping." />
          <ParamRow name="customerId" type="string | null" description="Pre-filled buyer customer_id. Null lets the checkout collect the buyer fresh." />
          <ParamRow name="networkKey" type="string | null" description="If set with tokenSymbol, spawned sessions start in 'active' with this currency locked." />
          <ParamRow name="tokenSymbol" type="string | null" description="Paired with networkKey." />
          <ParamRow name="isActive" type="boolean" description="Archived links 404." />
          <ParamRow name="maxRedemptions" type="number | null" description="Hard cap enforced atomically." />
          <ParamRow name="redemptionCount" type="number" description="Times the link has been resolved." />
          <ParamRow name="metadata" type="Record<string, string> | null" description="Inherits onto every spawned session." />
        </DocTableBody>
      </DocTable>

      <SectionHeading>paylix.listPaymentLinks()</SectionHeading>
      <CodeBlock language="ts">{`paylix.listPaymentLinks(): Promise<PaymentLink[]>`}</CodeBlock>

      <SectionHeading>paylix.getPaymentLink(id)</SectionHeading>
      <CodeBlock language="ts">{`paylix.getPaymentLink("link_..."): Promise<PaymentLink>`}</CodeBlock>

      <SectionHeading>paylix.updatePaymentLink(id, params)</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Only the supplied fields update. Pass <code>maxRedemptions: null</code>{" "}
        to clear an existing cap.
      </p>
      <CodeBlock language="ts">{`await paylix.updatePaymentLink("link_...", {
  name: "Updated label",
  maxRedemptions: null,
  isActive: false,
  metadata: { campaign: "spring" },
});`}</CodeBlock>

      <SectionHeading>paylix.archivePaymentLink(id)</SectionHeading>
      <CodeBlock language="ts">{`paylix.archivePaymentLink("link_..."): Promise<void>`}</CodeBlock>
    </>
  );
}
