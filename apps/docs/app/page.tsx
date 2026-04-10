import type { Metadata } from "next";

export const metadata: Metadata = { title: "Getting Started" };

export default function GettingStarted() {
  return (
    <>
      <h1 className="text-[30px] font-semibold tracking-[-0.6px]">
        Getting Started
      </h1>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4 mt-4">
        Paylix lets you accept USDC payments and subscriptions on Base with a
        few lines of TypeScript. No custodial wallets, no payment processors
        &mdash; funds go directly to your wallet.
      </p>

      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        1. Install the SDK
      </h2>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`npm install @paylix/sdk`}
      </pre>

      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        2. Initialize the Client
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Create a Paylix instance with your API key. You can get your API key
        from the{" "}
        <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
          Settings &rarr; API Keys
        </code>{" "}
        page in the dashboard.
      </p>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`import { Paylix } from "@paylix/sdk";

const paylix = new Paylix({
  apiKey: "sk_live_...",
  network: "base",           // "base" or "base-sepolia"
  merchantWallet: "0xYourWalletAddress",
  backendUrl: "https://your-paylix-instance.com",
});`}
      </pre>

      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        3. Create a Checkout
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Create a one-time payment checkout and redirect your customer to the
        hosted checkout page.
      </p>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`const { checkoutUrl, checkoutId } = await paylix.createCheckout({
  productId: "prod_abc123",
  customerId: "cust_xyz",        // optional
  successUrl: "https://example.com/success",
  cancelUrl: "https://example.com/cancel",
  metadata: { orderId: "42" },   // optional
});

// Redirect the user
window.location.href = checkoutUrl;`}
      </pre>

      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        4. Verify the Payment
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        After the customer completes payment, verify it server-side before
        fulfilling the order.
      </p>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`const result = await paylix.verifyPayment({
  paymentId: "pay_abc123",
});

if (result.verified) {
  // Fulfill the order
  console.log("Payment confirmed:", result.txHash);
  console.log("Amount:", result.amount, "USDC");
}`}
      </pre>

      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        5. Handle Webhooks
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Set up a webhook endpoint to receive real-time payment events. See the{" "}
        <a href="/webhooks" className="text-[#06d6a0] hover:underline">
          Webhooks guide
        </a>{" "}
        for full details.
      </p>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`import { webhooks } from "@paylix/sdk";

// In your API route handler
const isValid = webhooks.verify({
  payload: requestBody,
  signature: req.headers["x-paylix-signature"],
  secret: "whsec_...",
});

if (isValid) {
  const event = JSON.parse(requestBody);
  switch (event.type) {
    case "payment.confirmed":
      // Fulfill order
      break;
    case "subscription.created":
      // Activate subscription
      break;
  }
}`}
      </pre>

      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        Next Steps
      </h2>
      <ul className="text-sm text-[#94a3b8] leading-relaxed mb-4 list-disc pl-5 space-y-2">
        <li>
          <a href="/sdk-reference" className="text-[#06d6a0] hover:underline">
            SDK Reference
          </a>{" "}
          &mdash; every method with full TypeScript signatures
        </li>
        <li>
          <a href="/webhooks" className="text-[#06d6a0] hover:underline">
            Webhooks
          </a>{" "}
          &mdash; event types, payloads, and signature verification
        </li>
        <li>
          <a href="/self-hosting" className="text-[#06d6a0] hover:underline">
            Self-Hosting
          </a>{" "}
          &mdash; run Paylix on your own infrastructure
        </li>
        <li>
          <a href="/testnet" className="text-[#06d6a0] hover:underline">
            Testnet Setup
          </a>{" "}
          &mdash; test with Base Sepolia before going live
        </li>
      </ul>
    </>
  );
}
