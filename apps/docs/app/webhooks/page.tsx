import type { Metadata } from "next";

export const metadata: Metadata = { title: "Webhooks" };

export default function Webhooks() {
  return (
    <>
      <h1 className="text-[30px] font-semibold tracking-[-0.6px]">Webhooks</h1>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4 mt-4">
        Paylix sends webhook events to your server when payments and
        subscriptions change state. Use webhooks to fulfill orders, activate
        subscriptions, and keep your system in sync.
      </p>

      {/* ── Setup ──────────────────────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        Setting Up Webhooks
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Configure your webhook endpoint in the Paylix dashboard under{" "}
        <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
          Settings &rarr; Webhooks
        </code>
        . You&apos;ll receive a webhook secret (
        <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
          whsec_...
        </code>
        ) used to verify signatures.
      </p>

      {/* ── Signature Verification ─────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        Signature Verification
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Every webhook request includes an{" "}
        <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
          x-paylix-signature
        </code>{" "}
        header. Always verify the signature before processing the event.
      </p>

      <h3 className="text-base font-medium mt-8 mb-3">Next.js App Router</h3>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`// app/api/webhooks/paylix/route.ts
import { webhooks } from "@paylix/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("x-paylix-signature")!;

  const isValid = webhooks.verify({
    payload,
    signature,
    secret: process.env.PAYLIX_WEBHOOK_SECRET!,
  });

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(payload);

  switch (event.type) {
    case "payment.confirmed":
      // Fulfill the order
      await fulfillOrder(event.data.productId, event.data.customerId);
      break;

    case "subscription.created":
      // Activate the subscription in your database
      await activateSubscription(event.data.subscriptionId);
      break;

    case "subscription.charged":
      // Record the recurring charge
      await recordCharge(event.data.subscriptionId, event.data.amount);
      break;

    case "subscription.past_due":
      // Notify the customer, restrict access
      await handlePastDue(event.data.subscriptionId);
      break;

    case "subscription.cancelled":
      // Revoke access
      await revokeAccess(event.data.subscriptionId);
      break;
  }

  return NextResponse.json({ received: true });
}`}
      </pre>

      <h3 className="text-base font-medium mt-8 mb-3">Express</h3>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`import express from "express";
import { webhooks } from "@paylix/sdk";

const app = express();

// Use raw body for signature verification
app.post(
  "/api/webhooks/paylix",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const payload = req.body.toString();
    const signature = req.headers["x-paylix-signature"] as string;

    const isValid = webhooks.verify({
      payload,
      signature,
      secret: process.env.PAYLIX_WEBHOOK_SECRET!,
    });

    if (!isValid) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const event = JSON.parse(payload);
    // Handle event...

    res.json({ received: true });
  }
);`}
      </pre>

      {/* ── Events ─────────────────────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        Event Types
      </h2>

      {/* payment.confirmed */}
      <h3 className="text-base font-medium mt-8 mb-3">
        <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
          payment.confirmed
        </code>
      </h3>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Sent when a one-time payment is confirmed on-chain. This is the primary
        event for fulfilling orders.
      </p>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`{
  "type": "payment.confirmed",
  "data": {
    "paymentId": "pay_abc123",
    "checkoutId": "chk_xyz789",
    "productId": "prod_abc123",
    "customerId": "cust_xyz",
    "amount": 1000,
    "fee": 30,
    "currency": "USDC",
    "chain": "base",
    "txHash": "0xabc...def",
    "merchantWallet": "0x1234...abcd",
    "metadata": { "orderId": "42" },
    "confirmedAt": "2026-01-15T10:30:00Z"
  }
}`}
      </pre>

      {/* subscription.created */}
      <h3 className="text-base font-medium mt-8 mb-3">
        <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
          subscription.created
        </code>
      </h3>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Sent when a customer successfully sets up a new subscription and the
        first payment is confirmed.
      </p>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`{
  "type": "subscription.created",
  "data": {
    "subscriptionId": "sub_abc123",
    "productId": "prod_monthly_pro",
    "customerId": "cust_xyz",
    "amount": 2000,
    "currency": "USDC",
    "chain": "base",
    "interval": "monthly",
    "subscriberWallet": "0xabcd...1234",
    "merchantWallet": "0x1234...abcd",
    "metadata": {},
    "createdAt": "2026-01-15T10:30:00Z",
    "nextChargeAt": "2026-02-15T10:30:00Z"
  }
}`}
      </pre>

      {/* subscription.charged */}
      <h3 className="text-base font-medium mt-8 mb-3">
        <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
          subscription.charged
        </code>
      </h3>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Sent when a recurring subscription charge is successfully processed.
      </p>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`{
  "type": "subscription.charged",
  "data": {
    "subscriptionId": "sub_abc123",
    "paymentId": "pay_def456",
    "productId": "prod_monthly_pro",
    "customerId": "cust_xyz",
    "amount": 2000,
    "fee": 60,
    "currency": "USDC",
    "chain": "base",
    "txHash": "0xdef...789",
    "chargedAt": "2026-02-15T10:30:00Z",
    "nextChargeAt": "2026-03-15T10:30:00Z"
  }
}`}
      </pre>

      {/* subscription.past_due */}
      <h3 className="text-base font-medium mt-8 mb-3">
        <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
          subscription.past_due
        </code>
      </h3>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Sent when a recurring charge fails (e.g. insufficient USDC balance or
        allowance expired). The subscription is still active but needs attention.
      </p>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`{
  "type": "subscription.past_due",
  "data": {
    "subscriptionId": "sub_abc123",
    "productId": "prod_monthly_pro",
    "customerId": "cust_xyz",
    "reason": "insufficient_balance",
    "failedAt": "2026-02-15T10:30:00Z",
    "retryAt": "2026-02-16T10:30:00Z"
  }
}`}
      </pre>

      {/* subscription.cancelled */}
      <h3 className="text-base font-medium mt-8 mb-3">
        <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
          subscription.cancelled
        </code>
      </h3>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Sent when a subscription is cancelled, either by the merchant or the
        customer.
      </p>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`{
  "type": "subscription.cancelled",
  "data": {
    "subscriptionId": "sub_abc123",
    "productId": "prod_monthly_pro",
    "customerId": "cust_xyz",
    "cancelledBy": "merchant",
    "cancelledAt": "2026-03-01T12:00:00Z"
  }
}`}
      </pre>

      {/* ── Best Practices ─────────────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        Best Practices
      </h2>
      <ul className="text-sm text-[#94a3b8] leading-relaxed mb-4 list-disc pl-5 space-y-2">
        <li>
          <strong className="text-[#f0f0f3]">Always verify signatures</strong>{" "}
          before processing events. Never trust unverified payloads.
        </li>
        <li>
          <strong className="text-[#f0f0f3]">Return 200 quickly</strong>. Do
          heavy processing asynchronously. Paylix retries on non-2xx responses.
        </li>
        <li>
          <strong className="text-[#f0f0f3]">Handle duplicates</strong>. Use the{" "}
          <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
            paymentId
          </code>{" "}
          or{" "}
          <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
            subscriptionId
          </code>{" "}
          for idempotency.
        </li>
        <li>
          <strong className="text-[#f0f0f3]">Use raw body</strong> for
          signature verification. Parsed JSON bodies will fail verification.
        </li>
      </ul>
    </>
  );
}
