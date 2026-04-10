import type { Metadata } from "next";

export const metadata: Metadata = { title: "Subscriptions" };

export default function SubscriptionsPage() {
  return (
    <>
      <h1 className="text-[30px] font-semibold tracking-[-0.6px]">
        Subscriptions
      </h1>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4 mt-4">
        Paylix subscriptions are recurring USDC charges executed on-chain.
        Each active subscription lives in two places: a row in your Paylix
        database and a record inside the{" "}
        <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
          SubscriptionManager
        </code>{" "}
        smart contract on Base. The two layers must stay in sync — which is
        why cancellation requires more than a database update.
      </p>

      {/* ── How subscriptions work ─────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        How subscriptions work
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        When a customer subscribes, they sign a one-time ERC-20 approval that
        lets the Paylix smart contract pull USDC from their wallet on a
        recurring schedule. A background keeper calls{" "}
        <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
          chargeSubscription()
        </code>{" "}
        on the interval you configured. Funds move directly from the
        subscriber&apos;s wallet to your merchant wallet — Paylix never custodies
        money.
      </p>

      {/* ── Creating a subscription ────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        Creating a subscription
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        You can create subscriptions two ways: generate a hosted checkout link
        via the SDK, or send customers to a product&apos;s shareable checkout URL
        from the dashboard.
      </p>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`const { checkoutUrl, subscriptionId } = await paylix.createSubscription({
  productId: "prod_monthly_pro",
  customerId: "cust_xyz",
  successUrl: "https://example.com/welcome",
  cancelUrl: "https://example.com/pricing",
});

// Redirect the customer to checkoutUrl to approve and activate.`}
      </pre>

      {/* ── Billing intervals ──────────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        Billing intervals
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Every subscription product is configured with a billing interval. The
        keeper uses this to decide when the next on-chain charge should run.
      </p>
      <ul className="text-sm text-[#94a3b8] leading-relaxed mb-4 space-y-1.5 list-disc pl-5">
        <li>
          <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">minutely</code>
          {" "}— for testing only, charges every minute
        </li>
        <li>
          <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">weekly</code>
          {" "}— every 7 days
        </li>
        <li>
          <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">biweekly</code>
          {" "}— every 14 days
        </li>
        <li>
          <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">monthly</code>
          {" "}— every 30 days
        </li>
        <li>
          <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">quarterly</code>
          {" "}— every 90 days
        </li>
        <li>
          <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">yearly</code>
          {" "}— every 365 days
        </li>
      </ul>

      {/* ── Approval mechanism ─────────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        The approval mechanism
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Instead of storing a card on file, subscribers grant a spending
        allowance once. At checkout, the customer signs two transactions:
      </p>
      <ol className="text-sm text-[#94a3b8] leading-relaxed mb-4 space-y-2 list-decimal pl-5">
        <li>
          An{" "}
          <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
            approve()
          </code>{" "}
          on the USDC contract, giving the Paylix{" "}
          <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
            SubscriptionManager
          </code>{" "}
          permission to pull a capped amount of USDC.
        </li>
        <li>
          A call to{" "}
          <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
            createSubscription()
          </code>{" "}
          on the contract, which registers the schedule and collects the first
          charge.
        </li>
      </ol>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        After that, the Paylix keeper service calls the contract on schedule.
        Every successful charge emits a{" "}
        <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
          SubscriptionCharged
        </code>{" "}
        event that the indexer picks up and persists to your database.
      </p>

      {/* ── Cancelling subscriptions ───────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        Cancelling subscriptions
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Cancellation is the part developers most often get wrong. Because the
        schedule lives inside the smart contract, a database-only update{" "}
        <span className="text-[#f0f0f3]">will not</span> stop future charges —
        the keeper will keep pulling USDC until the on-chain record is
        terminated.
      </p>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        To actually cancel a subscription, someone has to call{" "}
        <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
          cancelSubscription()
        </code>{" "}
        on the{" "}
        <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
          SubscriptionManager
        </code>{" "}
        contract. The contract enforces a strict access check and only allows
        two addresses to cancel a given subscription:
      </p>
      <ul className="text-sm text-[#94a3b8] leading-relaxed mb-4 space-y-1.5 list-disc pl-5">
        <li>
          <span className="text-[#f0f0f3]">The subscriber&apos;s wallet</span>
          {" "}— the address that signed the original approval.
        </li>
        <li>
          <span className="text-[#f0f0f3]">The merchant wallet</span>
          {" "}— the address configured in your Paylix project that receives the
          charges.
        </li>
      </ul>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        No one else — not the Paylix backend, not an API key, not a server-side
        process — can terminate an on-chain subscription on their behalf. This
        is by design: the subscriber&apos;s funds are protected by the same
        permission model as any other self-custodial wallet.
      </p>

      <h3 className="text-base font-medium mt-8 mb-3">Two cancellation paths</h3>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Paylix exposes two UIs that call the contract for you:
      </p>
      <ul className="text-sm text-[#94a3b8] leading-relaxed mb-4 space-y-2 list-disc pl-5">
        <li>
          <span className="text-[#f0f0f3]">Merchant dashboard</span> — from the
          Subscribers page, click Cancel. You will be prompted to connect your
          merchant wallet and sign the transaction yourself.
        </li>
        <li>
          <span className="text-[#f0f0f3]">Customer portal</span> — the
          subscriber visits their portal link, clicks Cancel on an active
          subscription, and signs the transaction with their own wallet.
        </li>
      </ul>

      <h3 className="text-base font-medium mt-8 mb-3">Step-by-step flow</h3>
      <ol className="text-sm text-[#94a3b8] leading-relaxed mb-4 space-y-2 list-decimal pl-5">
        <li>User clicks the Cancel button on a subscription.</li>
        <li>The modal prompts them to connect the merchant or subscriber wallet.</li>
        <li>
          They sign a{" "}
          <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
            cancelSubscription(onChainId)
          </code>{" "}
          transaction on Base.
        </li>
        <li>
          The contract emits a{" "}
          <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
            SubscriptionCancelled
          </code>{" "}
          event once the transaction is mined.
        </li>
        <li>
          The Paylix indexer detects the event and updates the database row to
          status{" "}
          <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#f87171]">
            cancelled
          </code>.
        </li>
        <li>
          On the next keeper tick, the subscription is skipped. No further
          charges are attempted.
        </li>
        <li>
          A{" "}
          <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
            subscription.cancelled
          </code>{" "}
          webhook is delivered to your endpoint.
        </li>
      </ol>

      {/* ── Failed payments ────────────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        Failed payments (past_due)
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        If the keeper tries to charge and the transaction reverts — most often
        because the subscriber is out of USDC, or has revoked the approval on
        the USDC contract — the subscription moves to status{" "}
        <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#fbbf24]">
          past_due
        </code>{" "}
        and a{" "}
        <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
          subscription.past_due
        </code>{" "}
        webhook is sent. The keeper will retry on the next tick. To fully end a
        past-due subscription, still call{" "}
        <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
          cancelSubscription()
        </code>{" "}
        on-chain — otherwise the schedule stays registered.
      </p>

      {/* ── Webhooks ───────────────────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        Webhooks
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Subscriptions fire four webhook event types over their lifetime:
      </p>
      <ul className="text-sm text-[#94a3b8] leading-relaxed mb-4 space-y-1.5 list-disc pl-5">
        <li>
          <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">subscription.created</code>
          {" "}— first charge confirmed, subscription active.
        </li>
        <li>
          <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">subscription.charged</code>
          {" "}— a recurring charge was processed successfully.
        </li>
        <li>
          <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">subscription.past_due</code>
          {" "}— a recurring charge failed; status is now past_due.
        </li>
        <li>
          <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">subscription.cancelled</code>
          {" "}— an on-chain cancel was detected; subscription is terminated.
        </li>
      </ul>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        See the{" "}
        <a href="/webhooks" className="text-[#06d6a0] hover:underline">
          Webhooks
        </a>{" "}
        reference for full payload schemas and signature verification.
      </p>
    </>
  );
}
