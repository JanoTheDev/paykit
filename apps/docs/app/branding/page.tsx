import type { Metadata } from "next";
import {
  CodeBlock,
  PageHeading,
  SectionHeading,
  SubsectionHeading,
} from "@/components/docs";

export const metadata: Metadata = { title: "Branding" };

export default function BrandingPage() {
  return (
    <>
      <PageHeading
        title="Branding"
        description="Put your logo, legal name, support email, and footer text on every outbound email and hosted invoice."
      />

      <SectionHeading>Where to set it</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Open{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
          Settings → Business profile
        </code>
        . Fields used for branding:
      </p>
      <ul className="ml-5 list-disc space-y-2 text-sm leading-relaxed text-foreground-muted">
        <li>
          <strong>Legal name</strong> — rendered at the top of every email and
          invoice.
        </li>
        <li>
          <strong>Logo URL</strong> — must be HTTP(S). Malformed URLs are
          silently dropped so emails never render a broken image.
        </li>
        <li>
          <strong>Support email</strong> — appears in the email footer ("Questions?
          Reach us at …") and on the hosted invoice page.
        </li>
        <li>
          <strong>Invoice footer</strong> — free-form text rendered at the
          bottom of invoices and supported email templates.
        </li>
      </ul>

      <SectionHeading>Where it shows</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Trial, subscription, invoice, receipt, abandonment-recovery, and
        past-due emails all render a shared branded header + footer. The
        hosted invoice page (<code>/i/:token</code>) uses the same branding
        fields directly from the invoice row.
      </p>

      <SubsectionHeading>Fallback</SubsectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        When a field is empty, the template falls back to "Paylix" branding
        and drops the footer if there's nothing to show — never a blank
        field.
      </p>

      <SectionHeading>Security</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Logo URLs are parsed and protocol-checked before render. Only{" "}
        <code>http:</code> and <code>https:</code> pass through.
        <br />
        All email styling is inline — no remote CSS, no external fonts — so
        receivers like Gmail don't strip the markup.
      </p>

      <CodeBlock language="ts">{`// Example: populate the profile via the SDK (coming soon) or the dashboard.
// The email sender loads this row once per dispatch and passes it to
// the template. Empty values simply omit that part of the UI.`}</CodeBlock>
    </>
  );
}
