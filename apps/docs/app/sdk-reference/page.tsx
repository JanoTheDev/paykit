import type { Metadata } from "next";
import {
  Callout,
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

export const metadata: Metadata = { title: "SDK Reference" };

export default function SdkReference() {
  return (
    <>
      <PageHeading
        title="SDK Reference"
        description={
          <>
            Complete API reference for{" "}
            <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
              @paylix/sdk
            </code>
            . Every method, parameter, and return type.
          </>
        }
      />

      <SectionHeading>Constructor</SectionHeading>
      <CodeBlock language="ts">{`new Paylix(config: PaylixConfig)`}</CodeBlock>

      <SubsectionHeading>PaylixConfig</SubsectionHeading>
      <DocTable>
        <DocTableHead>
          <DocTableRow>
            <DocTableHeader>Parameter</DocTableHeader>
            <DocTableHeader>Type</DocTableHeader>
            <DocTableHeader>Description</DocTableHeader>
          </DocTableRow>
        </DocTableHead>
        <DocTableBody>
          <ParamRow
            name="apiKey"
            type="string"
            required
            description="Your secret API key (sk_live_... or sk_test_...)."
          />
          <ParamRow
            name="network"
            type={`"base" | "base-sepolia"`}
            required
            description="Target blockchain network."
          />
          <ParamRow
            name="merchantWallet"
            type="string"
            required
            description="Your wallet address that receives payments."
          />
          <ParamRow
            name="backendUrl"
            type="string"
            required
            description="URL of your Paylix backend instance."
          />
        </DocTableBody>
      </DocTable>

      <CodeBlock language="ts">{`import { Paylix } from "@paylix/sdk";

const paylix = new Paylix({
  apiKey: "sk_live_abc123",
  network: "base",
  merchantWallet: "0x1234...abcd",
  backendUrl: "https://paylix.example.com",
});`}</CodeBlock>

      <SectionHeading>paylix.createCheckout()</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Creates a one-time payment checkout session.
      </p>
      <CodeBlock language="ts">{`paylix.createCheckout(params: CreateCheckoutParams): Promise<CreateCheckoutResult>`}</CodeBlock>

      <SubsectionHeading>Parameters</SubsectionHeading>
      <DocTable>
        <DocTableHead>
          <DocTableRow>
            <DocTableHeader>Parameter</DocTableHeader>
            <DocTableHeader>Type</DocTableHeader>
            <DocTableHeader>Description</DocTableHeader>
          </DocTableRow>
        </DocTableHead>
        <DocTableBody>
          <ParamRow
            name="productId"
            type="string"
            required
            description="ID of the product to charge for."
          />
          <ParamRow
            name="customerId"
            type="string"
            description="Your customer identifier."
          />
          <ParamRow
            name="successUrl"
            type="string"
            description="Redirect URL after successful payment."
          />
          <ParamRow
            name="cancelUrl"
            type="string"
            description="Redirect URL if the customer cancels."
          />
          <ParamRow
            name="metadata"
            type="Record<string, string>"
            description="Arbitrary key-value data attached to the checkout."
          />
        </DocTableBody>
      </DocTable>

      <SubsectionHeading>Returns</SubsectionHeading>
      <DocTable>
        <DocTableHead>
          <DocTableRow>
            <DocTableHeader>Field</DocTableHeader>
            <DocTableHeader>Type</DocTableHeader>
            <DocTableHeader>Description</DocTableHeader>
          </DocTableRow>
        </DocTableHead>
        <DocTableBody>
          <ParamRow
            name="checkoutUrl"
            type="string"
            description="Hosted checkout page URL. Redirect the customer here."
          />
          <ParamRow
            name="checkoutId"
            type="string"
            description="Unique identifier for this checkout session."
          />
        </DocTableBody>
      </DocTable>

      <CodeBlock language="ts">{`const { checkoutUrl, checkoutId } = await paylix.createCheckout({
  productId: "prod_abc123",
  customerId: "cust_xyz",
  successUrl: "https://example.com/success",
  cancelUrl: "https://example.com/cancel",
  metadata: { orderId: "42" },
});`}</CodeBlock>

      <SectionHeading>paylix.createSubscription()</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Creates a recurring subscription checkout session.
      </p>
      <CodeBlock language="ts">{`paylix.createSubscription(params: CreateSubscriptionParams): Promise<CreateSubscriptionResult>`}</CodeBlock>

      <SubsectionHeading>Parameters</SubsectionHeading>
      <DocTable>
        <DocTableHead>
          <DocTableRow>
            <DocTableHeader>Parameter</DocTableHeader>
            <DocTableHeader>Type</DocTableHeader>
            <DocTableHeader>Description</DocTableHeader>
          </DocTableRow>
        </DocTableHead>
        <DocTableBody>
          <ParamRow
            name="productId"
            type="string"
            required
            description="ID of the subscription product."
          />
          <ParamRow
            name="customerId"
            type="string"
            description="Your customer identifier."
          />
          <ParamRow
            name="successUrl"
            type="string"
            description="Redirect URL after successful setup."
          />
          <ParamRow
            name="cancelUrl"
            type="string"
            description="Redirect URL if the customer cancels."
          />
          <ParamRow
            name="metadata"
            type="Record<string, string>"
            description="Arbitrary key-value data."
          />
        </DocTableBody>
      </DocTable>

      <SubsectionHeading>Returns</SubsectionHeading>
      <DocTable>
        <DocTableHead>
          <DocTableRow>
            <DocTableHeader>Field</DocTableHeader>
            <DocTableHeader>Type</DocTableHeader>
            <DocTableHeader>Description</DocTableHeader>
          </DocTableRow>
        </DocTableHead>
        <DocTableBody>
          <ParamRow
            name="checkoutUrl"
            type="string"
            description="Hosted checkout page URL."
          />
          <ParamRow
            name="subscriptionId"
            type="string"
            description="Unique identifier for the subscription."
          />
        </DocTableBody>
      </DocTable>

      <CodeBlock language="ts">{`const { checkoutUrl, subscriptionId } = await paylix.createSubscription({
  productId: "prod_monthly_pro",
  customerId: "cust_xyz",
  successUrl: "https://example.com/welcome",
  cancelUrl: "https://example.com/pricing",
});`}</CodeBlock>

      <SectionHeading>paylix.cancelSubscription()</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Marks a subscription as cancelled in the Paylix database so it stops
        appearing in active lists.
      </p>
      <CodeBlock language="ts">{`paylix.cancelSubscription(params: { subscriptionId: string }): Promise<void>`}</CodeBlock>
      <CodeBlock language="ts">{`await paylix.cancelSubscription({
  subscriptionId: "sub_abc123",
});`}</CodeBlock>

      <Callout variant="warning" title="This does not stop on-chain charges">
        Subscriptions live on the blockchain. This SDK method only updates the
        Paylix database — it does not terminate the on-chain schedule. The
        smart contract only allows the{" "}
        <span className="text-foreground">subscriber&apos;s wallet</span> or the{" "}
        <span className="text-foreground">merchant wallet</span> to call{" "}
        <code className="rounded bg-surface-2 px-1 py-0.5 font-mono text-[12px] text-primary">
          cancelSubscription()
        </code>
        , so to actually stop future charges someone must sign the cancel
        transaction via the merchant dashboard or the customer portal. See{" "}
        <a href="/subscriptions" className="text-primary hover:underline">
          Subscriptions
        </a>{" "}
        for the full flow.
      </Callout>

      <SectionHeading>paylix.updateSubscriptionWallet()</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Prompts the subscriber to update the wallet used for recurring charges
        (e.g. if they want to pay from a different address).
      </p>
      <CodeBlock language="ts">{`paylix.updateSubscriptionWallet(params: { subscriptionId: string }): Promise<void>`}</CodeBlock>
      <CodeBlock language="ts">{`await paylix.updateSubscriptionWallet({
  subscriptionId: "sub_abc123",
});`}</CodeBlock>

      <SectionHeading>paylix.verifyPayment()</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Verifies a payment&apos;s status and returns transaction details. Always
        verify server-side before fulfilling orders.
      </p>
      <CodeBlock language="ts">{`paylix.verifyPayment(params: { paymentId: string }): Promise<VerifyPaymentResult>`}</CodeBlock>

      <SubsectionHeading>Returns</SubsectionHeading>
      <DocTable>
        <DocTableHead>
          <DocTableRow>
            <DocTableHeader>Field</DocTableHeader>
            <DocTableHeader>Type</DocTableHeader>
            <DocTableHeader>Description</DocTableHeader>
          </DocTableRow>
        </DocTableHead>
        <DocTableBody>
          <ParamRow
            name="verified"
            type="boolean"
            description="Whether the payment is confirmed on-chain."
          />
          <ParamRow
            name="amount"
            type="number"
            description="Payment amount in USDC (integer cents, e.g. 1000 = $10.00)."
          />
          <ParamRow
            name="fee"
            type="number"
            description="Platform fee in USDC cents."
          />
          <ParamRow
            name="txHash"
            type="string"
            description="On-chain transaction hash."
          />
          <ParamRow
            name="chain"
            type="string"
            description={`Network the payment was made on (e.g. "base").`}
          />
          <ParamRow
            name="customerId"
            type="string"
            description="Customer identifier."
          />
          <ParamRow
            name="productId"
            type="string"
            description="Product identifier."
          />
          <ParamRow
            name="status"
            type="string"
            description={`Payment status: "confirmed", "pending", or "failed".`}
          />
        </DocTableBody>
      </DocTable>

      <CodeBlock language="ts">{`const result = await paylix.verifyPayment({
  paymentId: "pay_abc123",
});

if (result.verified) {
  console.log("Confirmed:", result.txHash);
  console.log("Amount:", result.amount / 100, "USDC");
}`}</CodeBlock>

      <SectionHeading>paylix.getCustomerPortal()</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Retrieves a customer&apos;s payment history and subscription details.
      </p>
      <CodeBlock language="ts">{`paylix.getCustomerPortal(params: { customerId: string }): Promise<CustomerPortal>`}</CodeBlock>

      <SubsectionHeading>Returns</SubsectionHeading>
      <DocTable>
        <DocTableHead>
          <DocTableRow>
            <DocTableHeader>Field</DocTableHeader>
            <DocTableHeader>Type</DocTableHeader>
            <DocTableHeader>Description</DocTableHeader>
          </DocTableRow>
        </DocTableHead>
        <DocTableBody>
          <ParamRow
            name="customer"
            type="Customer"
            description="Customer profile object."
          />
          <ParamRow
            name="payments"
            type="Payment[]"
            description="Array of all payments by this customer."
          />
          <ParamRow
            name="subscriptions"
            type="Subscription[]"
            description="Array of active and past subscriptions."
          />
        </DocTableBody>
      </DocTable>

      <CodeBlock language="ts">{`const portal = await paylix.getCustomerPortal({
  customerId: "cust_xyz",
});

console.log("Payments:", portal.payments.length);
console.log("Active subs:", portal.subscriptions.filter(s => s.status === "active").length);`}</CodeBlock>

      <SectionHeading>webhooks.verify()</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Verifies a webhook signature to ensure the event was sent by Paylix.
      </p>
      <CodeBlock language="ts">{`webhooks.verify(params: {
  payload: string;
  signature: string;
  secret: string;
}): boolean`}</CodeBlock>
      <CodeBlock language="ts">{`import { webhooks } from "@paylix/sdk";

const isValid = webhooks.verify({
  payload: rawBody,
  signature: req.headers["x-paylix-signature"],
  secret: process.env.PAYLIX_WEBHOOK_SECRET!,
});`}</CodeBlock>

      <SectionHeading>NETWORKS</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Exported constant containing network configurations.
      </p>
      <CodeBlock language="ts">{`import { NETWORKS } from "@paylix/sdk";

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
// }`}</CodeBlock>
    </>
  );
}
