import type { Metadata } from "next";
import {
  Callout,
  CodeBlock,
  PageHeading,
  SectionHeading,
  SubsectionHeading,
} from "@/components/docs";

export const metadata: Metadata = { title: "API Keys" };

export default function ApiKeysPage() {
  return (
    <>
      <PageHeading
        title="API Keys"
        description="Publishable and secret API keys, with in-place rotation that keeps the old secret live during a configurable grace period."
      />

      <SectionHeading>Two flavors</SectionHeading>
      <ul className="ml-5 list-disc space-y-2 text-sm leading-relaxed text-foreground-muted">
        <li>
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
            pk_
          </code>{" "}
          <strong>Publishable keys</strong> — safe in client code, higher
          rate limits, scoped to low-risk reads (e.g. the checkout page).
        </li>
        <li>
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
            sk_
          </code>{" "}
          <strong>Secret keys</strong> — server-only, full account access.
        </li>
      </ul>
      <p className="mt-4 text-sm leading-relaxed text-foreground-muted">
        The auth middleware decides capability from the prefix. Never
        paste an <code>sk_</code> key into browser code.
      </p>

      <SectionHeading>Create and revoke</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Open{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
          /dashboard/api-keys
        </code>
        . Click <strong>Generate Key</strong>, pick a type, and copy the
        secret once — it is never shown again. Revoke a key with the row
        action; revoked keys return 401 immediately.
      </p>

      <SectionHeading>Rotation with a grace period</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        The <strong>Rotate</strong> row action generates a new secret{" "}
        <em>on the same key id</em>. The previous hash remains valid until
        <code> expires_at</code> passes, so you can roll out the new
        secret across your infrastructure without downtime.
      </p>

      <SubsectionHeading>Grace options</SubsectionHeading>
      <ul className="ml-5 list-disc space-y-2 text-sm leading-relaxed text-foreground-muted">
        <li>
          <strong>Revoke immediately</strong> — old secret rejected on the
          very next request.
        </li>
        <li>
          <strong>24 hours</strong> — recommended for most rotations.
        </li>
        <li>
          <strong>7 days</strong> — for slow rollouts across many services.
        </li>
      </ul>

      <Callout variant="tip" title="Rotate on suspicion">
        If you suspect a secret leaked, rotate with <em>Revoke immediately</em>
        . The old hash is rejected the instant the dashboard call returns.
      </Callout>

      <SectionHeading>Auth middleware behavior</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Each incoming request hashes the bearer token and matches either
        the active <code>key_hash</code> OR a recent{" "}
        <code>previous_key_hash</code> whose{" "}
        <code>expires_at</code> is still in the future. Once the window
        passes, the previous hash is permanently invalid.
      </p>

      <SectionHeading>Audit log</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Every key create, rotate, and revoke is recorded in the audit log
        with the acting user, IP, and (for rotation) the chosen grace
        window.
      </p>

      <CodeBlock language="bash">{`# Example client rolling a rotated secret:
curl -H "Authorization: Bearer $OLD_SECRET" \\
  https://pay.example.com/api/me   # still works until expires_at
curl -H "Authorization: Bearer $NEW_SECRET" \\
  https://pay.example.com/api/me   # also works immediately`}</CodeBlock>
    </>
  );
}
