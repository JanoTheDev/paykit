import type { Metadata } from "next";
import {
  Callout,
  CodeBlock,
  PageHeading,
  SectionHeading,
  SubsectionHeading,
} from "@/components/docs";

export const metadata: Metadata = { title: "Tax" };

export default function TaxPage() {
  return (
    <>
      <PageHeading
        title="Tax"
        description="Built-in VAT + US sales tax rates keyed by the buyer's country (and US state). Stateless preview endpoint for hosted checkout; merchants can override per product."
      />

      <Callout variant="warning" title="v1 scope">
        The rate table + preview endpoint ship in this release. Full
        checkout integration — adding tax to the signed permit amount
        — is a follow-up. Merchants who need tax today can either
        price-in (add tax to product price upfront) or call the preview
        API from their own UI and stamp the invoice manually.
      </Callout>

      <SectionHeading>POST /api/tax/preview</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Pure view into the built-in rate table. No auth required.
      </p>
      <CodeBlock language="ts">{`const res = await fetch("/api/tax/preview", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    country: "DE",
    subtotalCents: 10000,
  }),
});
// { "tax": { "rateBps": 1900, "label": "DE VAT 19%",
//            "subtotalCents": 10000, "taxCents": 1900, "totalCents": 11900 } }`}</CodeBlock>

      <SubsectionHeading>US sales tax</SubsectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Pass <code>state</code> alongside <code>country: "US"</code> to
        resolve the state headline rate (no locality).
      </p>
      <CodeBlock language="json">{`{
  "country": "US",
  "state": "CA",
  "subtotalCents": 10000
}
// → rateBps 725, taxCents 725, totalCents 10725`}</CodeBlock>

      <SubsectionHeading>Reverse charge</SubsectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Pass <code>reverseCharge: true</code> when the buyer has a valid
        tax ID and the product is marked{" "}
        <code>reverse_charge_eligible</code>. The response comes back
        with <code>taxCents: 0</code> and a{" "}
        <code>"Reverse charge"</code> label you can stamp on the invoice.
      </p>

      <SubsectionHeading>Per-product override</SubsectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Pass <code>productRateBps</code> + <code>productLabel</code> to
        beat the rate table. Useful for flat-rate digital goods or
        jurisdictions the table doesn't cover.
      </p>

      <SectionHeading>Coverage</SectionHeading>
      <ul className="ml-5 list-disc space-y-1 text-sm leading-relaxed text-foreground-muted">
        <li>EU + UK + NO + CH VAT headline rates (2026).</li>
        <li>US state-level headline sales tax for all 50 states + DC.</li>
        <li>
          Other jurisdictions return <code>null</code> — merchant must
          either supply a product override or price-in.
        </li>
      </ul>
    </>
  );
}
