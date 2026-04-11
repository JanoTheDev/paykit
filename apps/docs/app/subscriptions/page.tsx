import type { Metadata } from "next";
import {
  Callout,
  CodeBlock,
  PageHeading,
  SectionHeading,
  SubsectionHeading,
} from "@/components/docs";

export const metadata: Metadata = { title: "Subscriptions" };

export default function SubscriptionsPage() {
  return (
    <>
      <PageHeading
        title="Subscriptions"
        description={
          <>
            Paylix subscriptions are recurring USDC charges executed on-chain.
            Each active subscription lives in two places: a row in your Paylix
            database and a record inside the{" "}
            <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
              SubscriptionManager
            </code>{" "}
            smart contract on Base. The Paylix relayer keeps the two layers
            in sync so you never have to touch a wallet to manage them.
          </>
        }
      />

      <Callout variant="info" title="Cancellation is gasless">
        Stopping a subscription terminates the on-chain record in the
        SubscriptionManager contract — it&apos;s not just a database flag. The
        Paylix backend owns a relayer that submits the cancel transaction on
        behalf of whoever initiated it (merchant dashboard, SDK, or customer
        portal), so no one signs anything and no one pays gas. The contract
        still enforces that the subscription belongs to the caller — the
        relayer can only cancel what the authenticated merchant or subscriber
        owns.
      </Callout>

      <SectionHeading>How subscriptions work</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        When a customer subscribes, they sign a one-time ERC-20 approval that
        lets the Paylix smart contract pull USDC from their wallet on a
        recurring schedule. A background keeper calls{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
          chargeSubscription()
        </code>{" "}
        on the interval you configured. Funds move directly from the
        subscriber&apos;s wallet to your merchant wallet — Paylix never custodies
        money.
      </p>

      <SectionHeading>Creating a subscription</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        You can create subscriptions two ways: generate a hosted checkout link
        via the SDK, or send customers to a product&apos;s shareable checkout URL
        from the dashboard.
      </p>
      <CodeBlock language="ts">{`const { checkoutUrl, subscriptionId } = await paylix.createSubscription({
  productId: "prod_monthly_pro",
  customerId: "cust_xyz",
  successUrl: "https://example.com/welcome",
  cancelUrl: "https://example.com/pricing",
});

// Redirect the customer to checkoutUrl to approve and activate.`}</CodeBlock>

      <SectionHeading>Billing intervals</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Every subscription product is configured with a billing interval. The
        keeper uses this to decide when the next on-chain charge should run.
      </p>
      <ul className="mt-4 space-y-1.5 pl-5 text-sm leading-relaxed text-foreground-muted [&>li]:list-disc">
        <li>
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
            minutely
          </code>{" "}
          — for testing only, charges every minute
        </li>
        <li>
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
            weekly
          </code>{" "}
          — every 7 days
        </li>
        <li>
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
            biweekly
          </code>{" "}
          — every 14 days
        </li>
        <li>
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
            monthly
          </code>{" "}
          — every 30 days
        </li>
        <li>
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
            quarterly
          </code>{" "}
          — every 90 days
        </li>
        <li>
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
            yearly
          </code>{" "}
          — every 365 days
        </li>
      </ul>

      <SectionHeading>The approval mechanism</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Instead of storing a card on file, subscribers grant a spending
        allowance once. At checkout, the customer signs two transactions:
      </p>
      <ol className="mt-4 space-y-2 pl-5 text-sm leading-relaxed text-foreground-muted [&>li]:list-decimal">
        <li>
          An{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
            approve()
          </code>{" "}
          on the USDC contract, giving the Paylix{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
            SubscriptionManager
          </code>{" "}
          permission to pull a capped amount of USDC.
        </li>
        <li>
          A call to{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
            createSubscription()
          </code>{" "}
          on the contract, which registers the schedule and collects the first
          charge.
        </li>
      </ol>
      <p className="mt-4 text-sm leading-relaxed text-foreground-muted">
        After that, the Paylix keeper service calls the contract on schedule.
        Every successful charge emits a{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
          SubscriptionCharged
        </code>{" "}
        event that the indexer picks up and persists to your database.
      </p>

      <SectionHeading>Cancelling subscriptions</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Cancelling a subscription terminates the on-chain record in the{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
          SubscriptionManager
        </code>{" "}
        contract and updates the database. Paylix runs a relayer that submits
        the transaction on behalf of whoever initiated the cancel, so no one
        signs anything and no one pays gas.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-foreground-muted">
        The contract still enforces a strict access check — it only allows
        cancelling a subscription that belongs to either the subscriber or the
        merchant on that record:
      </p>
      <ul className="mt-4 space-y-1.5 pl-5 text-sm leading-relaxed text-foreground-muted [&>li]:list-disc">
        <li>
          <span className="text-foreground">The subscriber&apos;s wallet</span> —
          the address that signed the original approval.
        </li>
        <li>
          <span className="text-foreground">The merchant wallet</span> — the
          address configured on your Paylix profile that receives the charges.
        </li>
      </ul>
      <p className="mt-4 text-sm leading-relaxed text-foreground-muted">
        The relayer cannot cancel a subscription it doesn&apos;t have authority
        over: the contract exposes{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
          cancelSubscriptionByRelayerForMerchant
        </code>{" "}
        and{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
          cancelSubscriptionByRelayerForSubscriber
        </code>
        , and both revert unless the wallet passed in actually owns the
        subscription. So even if the relayer key were compromised, it could
        not cancel arbitrary subscriptions.
      </p>

      <SubsectionHeading>Three cancellation paths</SubsectionHeading>
      <ul className="mt-4 space-y-2 pl-5 text-sm leading-relaxed text-foreground-muted [&>li]:list-disc">
        <li>
          <span className="text-foreground">Merchant dashboard</span> — from
          the Subscribers page, click Cancel. Authenticated via your dashboard
          session, cancelled on-chain via the relayer as the merchant.
        </li>
        <li>
          <span className="text-foreground">SDK</span> — call{" "}
          <code className="rounded bg-surface-2 px-1 py-0.5 font-mono text-[12px] text-primary">
            paylix.cancelSubscription()
          </code>{" "}
          from your backend. Authenticated via your secret API key, cancelled
          on-chain via the relayer as the merchant.
        </li>
        <li>
          <span className="text-foreground">Customer portal</span> — the
          subscriber visits their portal link and clicks Cancel. Authenticated
          via a signed portal token, cancelled on-chain via the relayer as the
          subscriber.
        </li>
      </ul>

      <SubsectionHeading>Step-by-step flow</SubsectionHeading>
      <ol className="mt-4 space-y-2 pl-5 text-sm leading-relaxed text-foreground-muted [&>li]:list-decimal">
        <li>
          The merchant or subscriber triggers a cancel (dashboard, SDK, or
          portal).
        </li>
        <li>
          The Paylix backend authenticates the caller and verifies that the
          authenticated wallet owns the subscription.
        </li>
        <li>
          The relayer submits the matching gasless cancel function on
          SubscriptionManager and waits for the transaction receipt.
        </li>
        <li>
          The contract emits a{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
            SubscriptionCancelled
          </code>{" "}
          event.
        </li>
        <li>
          The Paylix indexer detects the event and updates the database row to
          status{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-destructive">
            cancelled
          </code>
          .
        </li>
        <li>
          On the next keeper tick, the subscription is skipped. No further
          charges are attempted.
        </li>
        <li>
          A{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
            subscription.cancelled
          </code>{" "}
          webhook is delivered to your endpoint.
        </li>
      </ol>

      <SectionHeading>Failed payments (past_due)</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        If the keeper tries to charge and the transaction reverts — most often
        because the subscriber is out of USDC, or has revoked the approval on
        the USDC contract — the subscription moves to status{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-warning">
          past_due
        </code>{" "}
        and a{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
          subscription.past_due
        </code>{" "}
        webhook is sent. The keeper will retry on the next tick. To fully end
        a past-due subscription, use any of the cancel paths above — the
        schedule stays registered on-chain until it&apos;s explicitly
        cancelled.
      </p>

      <SectionHeading>Webhooks</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Subscriptions fire four webhook event types over their lifetime:
      </p>
      <ul className="mt-4 space-y-1.5 pl-5 text-sm leading-relaxed text-foreground-muted [&>li]:list-disc">
        <li>
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
            subscription.created
          </code>{" "}
          — first charge confirmed, subscription active.
        </li>
        <li>
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
            subscription.charged
          </code>{" "}
          — a recurring charge was processed successfully.
        </li>
        <li>
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
            subscription.past_due
          </code>{" "}
          — a recurring charge failed; status is now past_due.
        </li>
        <li>
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
            subscription.cancelled
          </code>{" "}
          — an on-chain cancel was detected; subscription is terminated.
        </li>
      </ul>
      <p className="mt-4 text-sm leading-relaxed text-foreground-muted">
        See the{" "}
        <a href="/webhooks" className="text-primary hover:underline">
          Webhooks
        </a>{" "}
        reference for full payload schemas and signature verification.
      </p>
    </>
  );
}
