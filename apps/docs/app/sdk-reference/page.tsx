import type { Metadata } from "next";

export const metadata: Metadata = { title: "SDK Reference" };

export default function SdkReference() {
  return (
    <>
      <h1 className="text-[30px] font-semibold tracking-[-0.6px]">
        SDK Reference
      </h1>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4 mt-4">
        Complete API reference for{" "}
        <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
          @paylix/sdk
        </code>
        . Every method, parameter, and return type.
      </p>

      {/* ── Constructor ────────────────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        Constructor
      </h2>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`new Paylix(config: PaylixConfig)`}
      </pre>
      <h3 className="text-base font-medium mt-8 mb-3">PaylixConfig</h3>
      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="border-b border-[rgba(148,163,184,0.12)] text-left text-[#94a3b8]">
            <th className="pb-2 font-medium">Parameter</th>
            <th className="pb-2 font-medium">Type</th>
            <th className="pb-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="text-[#f0f0f3]">
          <Param name="apiKey" type="string" desc="Your secret API key (sk_live_... or sk_test_...)." />
          <Param name="network" type={`"base" | "base-sepolia"`} desc="Target blockchain network." />
          <Param name="merchantWallet" type="string" desc="Your wallet address that receives payments." />
          <Param name="backendUrl" type="string" desc="URL of your Paylix backend instance." />
        </tbody>
      </table>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`import { Paylix } from "@paylix/sdk";

const paylix = new Paylix({
  apiKey: "sk_live_abc123",
  network: "base",
  merchantWallet: "0x1234...abcd",
  backendUrl: "https://paylix.example.com",
});`}
      </pre>

      {/* ── createCheckout ─────────────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        paylix.createCheckout()
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Creates a one-time payment checkout session.
      </p>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`paylix.createCheckout(params: CreateCheckoutParams): Promise<CreateCheckoutResult>`}
      </pre>
      <h3 className="text-base font-medium mt-8 mb-3">Parameters</h3>
      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="border-b border-[rgba(148,163,184,0.12)] text-left text-[#94a3b8]">
            <th className="pb-2 font-medium">Parameter</th>
            <th className="pb-2 font-medium">Type</th>
            <th className="pb-2 font-medium">Required</th>
            <th className="pb-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="text-[#f0f0f3]">
          <Param name="productId" type="string" req desc="ID of the product to charge for." />
          <Param name="customerId" type="string" desc="Your customer identifier." />
          <Param name="successUrl" type="string" desc="Redirect URL after successful payment." />
          <Param name="cancelUrl" type="string" desc="Redirect URL if the customer cancels." />
          <Param name="metadata" type="Record<string, string>" desc="Arbitrary key-value data attached to the checkout." />
        </tbody>
      </table>
      <h3 className="text-base font-medium mt-8 mb-3">Returns</h3>
      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="border-b border-[rgba(148,163,184,0.12)] text-left text-[#94a3b8]">
            <th className="pb-2 font-medium">Field</th>
            <th className="pb-2 font-medium">Type</th>
            <th className="pb-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="text-[#f0f0f3]">
          <Param name="checkoutUrl" type="string" desc="Hosted checkout page URL. Redirect the customer here." />
          <Param name="checkoutId" type="string" desc="Unique identifier for this checkout session." />
        </tbody>
      </table>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`const { checkoutUrl, checkoutId } = await paylix.createCheckout({
  productId: "prod_abc123",
  customerId: "cust_xyz",
  successUrl: "https://example.com/success",
  cancelUrl: "https://example.com/cancel",
  metadata: { orderId: "42" },
});`}
      </pre>

      {/* ── createSubscription ─────────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        paylix.createSubscription()
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Creates a recurring subscription checkout session.
      </p>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`paylix.createSubscription(params: CreateSubscriptionParams): Promise<CreateSubscriptionResult>`}
      </pre>
      <h3 className="text-base font-medium mt-8 mb-3">Parameters</h3>
      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="border-b border-[rgba(148,163,184,0.12)] text-left text-[#94a3b8]">
            <th className="pb-2 font-medium">Parameter</th>
            <th className="pb-2 font-medium">Type</th>
            <th className="pb-2 font-medium">Required</th>
            <th className="pb-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="text-[#f0f0f3]">
          <Param name="productId" type="string" req desc="ID of the subscription product." />
          <Param name="customerId" type="string" desc="Your customer identifier." />
          <Param name="successUrl" type="string" desc="Redirect URL after successful setup." />
          <Param name="cancelUrl" type="string" desc="Redirect URL if the customer cancels." />
          <Param name="metadata" type="Record<string, string>" desc="Arbitrary key-value data." />
        </tbody>
      </table>
      <h3 className="text-base font-medium mt-8 mb-3">Returns</h3>
      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="border-b border-[rgba(148,163,184,0.12)] text-left text-[#94a3b8]">
            <th className="pb-2 font-medium">Field</th>
            <th className="pb-2 font-medium">Type</th>
            <th className="pb-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="text-[#f0f0f3]">
          <Param name="checkoutUrl" type="string" desc="Hosted checkout page URL." />
          <Param name="subscriptionId" type="string" desc="Unique identifier for the subscription." />
        </tbody>
      </table>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`const { checkoutUrl, subscriptionId } = await paylix.createSubscription({
  productId: "prod_monthly_pro",
  customerId: "cust_xyz",
  successUrl: "https://example.com/welcome",
  cancelUrl: "https://example.com/pricing",
});`}
      </pre>

      {/* ── cancelSubscription ─────────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        paylix.cancelSubscription()
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Cancels an active subscription. The subscription will not renew.
      </p>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`paylix.cancelSubscription(params: { subscriptionId: string }): Promise<void>`}
      </pre>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`await paylix.cancelSubscription({
  subscriptionId: "sub_abc123",
});`}
      </pre>

      {/* ── updateSubscriptionWallet ───────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        paylix.updateSubscriptionWallet()
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Prompts the subscriber to update the wallet used for recurring charges
        (e.g. if they want to pay from a different address).
      </p>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`paylix.updateSubscriptionWallet(params: { subscriptionId: string }): Promise<void>`}
      </pre>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`await paylix.updateSubscriptionWallet({
  subscriptionId: "sub_abc123",
});`}
      </pre>

      {/* ── verifyPayment ──────────────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        paylix.verifyPayment()
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Verifies a payment&apos;s status and returns transaction details.
        Always verify server-side before fulfilling orders.
      </p>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`paylix.verifyPayment(params: { paymentId: string }): Promise<VerifyPaymentResult>`}
      </pre>
      <h3 className="text-base font-medium mt-8 mb-3">Returns</h3>
      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="border-b border-[rgba(148,163,184,0.12)] text-left text-[#94a3b8]">
            <th className="pb-2 font-medium">Field</th>
            <th className="pb-2 font-medium">Type</th>
            <th className="pb-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="text-[#f0f0f3]">
          <Param name="verified" type="boolean" desc="Whether the payment is confirmed on-chain." />
          <Param name="amount" type="number" desc="Payment amount in USDC (integer cents, e.g. 1000 = $10.00)." />
          <Param name="fee" type="number" desc="Platform fee in USDC cents." />
          <Param name="txHash" type="string" desc="On-chain transaction hash." />
          <Param name="chain" type="string" desc='Network the payment was made on (e.g. "base").' />
          <Param name="customerId" type="string" desc="Customer identifier." />
          <Param name="productId" type="string" desc="Product identifier." />
          <Param name="status" type="string" desc='Payment status: "confirmed", "pending", or "failed".' />
        </tbody>
      </table>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`const result = await paylix.verifyPayment({
  paymentId: "pay_abc123",
});

if (result.verified) {
  console.log("Confirmed:", result.txHash);
  console.log("Amount:", result.amount / 100, "USDC");
}`}
      </pre>

      {/* ── getCustomerPortal ──────────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        paylix.getCustomerPortal()
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Retrieves a customer&apos;s payment history and subscription details.
      </p>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`paylix.getCustomerPortal(params: { customerId: string }): Promise<CustomerPortal>`}
      </pre>
      <h3 className="text-base font-medium mt-8 mb-3">Returns</h3>
      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="border-b border-[rgba(148,163,184,0.12)] text-left text-[#94a3b8]">
            <th className="pb-2 font-medium">Field</th>
            <th className="pb-2 font-medium">Type</th>
            <th className="pb-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="text-[#f0f0f3]">
          <Param name="customer" type="Customer" desc="Customer profile object." />
          <Param name="payments" type="Payment[]" desc="Array of all payments by this customer." />
          <Param name="subscriptions" type="Subscription[]" desc="Array of active and past subscriptions." />
        </tbody>
      </table>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`const portal = await paylix.getCustomerPortal({
  customerId: "cust_xyz",
});

console.log("Payments:", portal.payments.length);
console.log("Active subs:", portal.subscriptions.filter(s => s.status === "active").length);`}
      </pre>

      {/* ── webhooks.verify ────────────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        webhooks.verify()
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Verifies a webhook signature to ensure the event was sent by Paylix.
      </p>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`webhooks.verify(params: {
  payload: string;
  signature: string;
  secret: string;
}): boolean`}
      </pre>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`import { webhooks } from "@paylix/sdk";

const isValid = webhooks.verify({
  payload: rawBody,
  signature: req.headers["x-paylix-signature"],
  secret: process.env.PAYLIX_WEBHOOK_SECRET!,
});`}
      </pre>

      {/* ── NETWORKS ───────────────────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        NETWORKS
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Exported constant containing network configurations.
      </p>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`import { NETWORKS } from "@paylix/sdk";

// NETWORKS = {
//   "base": {
//     chainId: 8453,
//     name: "Base",
//     rpcUrl: "https://mainnet.base.org",
//     usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
//     explorerUrl: "https://basescan.org",
//   },
//   "base-sepolia": {
//     chainId: 84532,
//     name: "Base Sepolia",
//     rpcUrl: "https://sepolia.base.org",
//     usdcAddress: "0x...",  // MockUSDC on testnet
//     explorerUrl: "https://sepolia.basescan.org",
//   },
// }`}
      </pre>
    </>
  );
}

function Param({
  name,
  type,
  desc,
  req,
}: {
  name: string;
  type: string;
  desc: string;
  req?: boolean;
}) {
  return (
    <tr className="border-b border-[rgba(148,163,184,0.06)]">
      <td className="py-2 font-mono text-[13px] text-[#06d6a0]">{name}</td>
      <td className="py-2 font-mono text-[13px] text-[#94a3b8]">{type}</td>
      {req !== undefined && (
        <td className="py-2 text-[#94a3b8]">{req ? "Yes" : "No"}</td>
      )}
      <td className="py-2 text-[#94a3b8]">{desc}</td>
    </tr>
  );
}
