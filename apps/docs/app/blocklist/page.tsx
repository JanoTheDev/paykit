import type { Metadata } from "next";
import {
  Callout,
  PageHeading,
  SectionHeading,
  SubsectionHeading,
} from "@/components/docs";

export const metadata: Metadata = { title: "Blocklist" };

export default function BlocklistPage() {
  return (
    <>
      <PageHeading
        title="Blocklist"
        description="Block specific wallets, emails (full address or domain), or countries from paying through any of your checkouts."
      />

      <Callout variant="info" title="Enforced in the relay path">
        Blocklist checks run inside the relay route, before any on-chain
        activity. A blocked buyer gets a 403 with a generic message — Paylix
        never reveals which entry matched, to prevent enumeration.
      </Callout>

      <SectionHeading>Adding entries</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Open{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
          /dashboard/blocklist
        </code>
        . Each entry has a type, value, and optional reason. Entries are
        mode-scoped — a live-mode block does not apply to test-mode
        checkouts and vice-versa.
      </p>

      <SubsectionHeading>Types</SubsectionHeading>
      <ul className="ml-5 list-disc space-y-2 text-sm leading-relaxed text-foreground-muted">
        <li>
          <strong>Wallet</strong> — full 0x address, compared
          case-insensitively.
        </li>
        <li>
          <strong>Email</strong> — either a full address (normalized with
          Gmail dots/+tag rules) or a bare domain (<code>spam.com</code>)
          to block everyone on that domain.
        </li>
        <li>
          <strong>Country</strong> — 2-letter ISO code, compared
          case-insensitively. Matched against the buyer&apos;s declared{" "}
          <code>buyerCountry</code> on the session.
        </li>
      </ul>

      <SectionHeading>How a buyer sees it</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        The relay returns HTTP 403 with error code{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
          blocked
        </code>{" "}
        and a generic message. Neither the dashboard nor the buyer-facing
        response surfaces which entry matched.
      </p>
    </>
  );
}
