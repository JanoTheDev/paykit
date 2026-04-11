import type { Metadata } from "next";
import {
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
        Cancels a subscription on-chain via the Paylix relayer. The call
        terminates the on-chain schedule in{" "}
        <code className="rounded bg-surface-2 px-1 py-0.5 font-mono text-[12px] text-primary">
          SubscriptionManager
        </code>{" "}
        and updates the Paylix database. The merchant signs nothing and pays no
        gas — the promise only resolves after the on-chain transaction has been
        mined.
      </p>
      <CodeBlock language="ts">{`paylix.cancelSubscription(params: { subscriptionId: string }): Promise<void>`}</CodeBlock>
      <CodeBlock language="ts">{`await paylix.cancelSubscription({
  subscriptionId: "sub_abc123",
});`}</CodeBlock>

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

      <SectionHeading>paylix.createPortalSession()</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Creates a signed, time-limited URL to the hosted customer portal.
        Redirect the customer to this URL so they can view their payments,
        subscriptions, and invoices, and cancel subscriptions — without
        needing a Paylix account.
      </p>
      <CodeBlock language="ts">{`paylix.createPortalSession(params: { customerId: string }): Promise<{ url: string }>`}</CodeBlock>
      <CodeBlock language="ts">{`const { url } = await paylix.createPortalSession({
  customerId: "cust_xyz",
});

// Redirect your user:
res.redirect(url);`}</CodeBlock>

      <SectionHeading>paylix.listCustomerInvoices()</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Lists all invoices issued to a customer. Each entry includes
        public URLs for the hosted invoice page, the on-demand invoice
        PDF, and the on-demand payment receipt PDF — you can pass these
        URLs directly to your customer or surface them in your own UI.
      </p>
      <CodeBlock language="ts">{`paylix.listCustomerInvoices(params: { customerId: string }): Promise<{ invoices: CustomerInvoice[] }>`}</CodeBlock>

      <SubsectionHeading>CustomerInvoice</SubsectionHeading>
      <DocTable>
        <DocTableHead>
          <DocTableRow>
            <DocTableHeader>Field</DocTableHeader>
            <DocTableHeader>Type</DocTableHeader>
            <DocTableHeader>Description</DocTableHeader>
          </DocTableRow>
        </DocTableHead>
        <DocTableBody>
          <ParamRow name="id" type="string" description="Invoice ID." />
          <ParamRow
            name="number"
            type="string"
            description={`Merchant-formatted invoice number (e.g. "INV-000042").`}
          />
          <ParamRow
            name="totalCents"
            type="number"
            description="Grand total in integer cents (1000 = 10.00 USDC)."
          />
          <ParamRow
            name="subtotalCents"
            type="number"
            description="Pre-tax subtotal in integer cents."
          />
          <ParamRow
            name="taxCents"
            type="number"
            description="Tax portion in integer cents (0 if reverse-charge or untaxed)."
          />
          <ParamRow
            name="taxLabel"
            type="string | null"
            description={`Label shown next to the tax line (e.g. "VAT 20%" or "Reverse charge — recipient liable").`}
          />
          <ParamRow
            name="currency"
            type="string"
            description={`Currency code ("USDC").`}
          />
          <ParamRow
            name="issuedAt"
            type="string"
            description="ISO-8601 timestamp of issue."
          />
          <ParamRow
            name="emailStatus"
            type={`"pending" | "sent" | "failed" | "skipped"`}
            description="Delivery state of the invoice email."
          />
          <ParamRow
            name="hostedUrl"
            type="string"
            description="Public HTML page the customer can bookmark."
          />
          <ParamRow
            name="invoicePdfUrl"
            type="string"
            description="On-demand invoice PDF download link."
          />
          <ParamRow
            name="receiptPdfUrl"
            type="string"
            description="On-demand payment receipt PDF download link."
          />
        </DocTableBody>
      </DocTable>

      <CodeBlock language="ts">{`const { invoices } = await paylix.listCustomerInvoices({
  customerId: "cust_xyz",
});

for (const invoice of invoices) {
  console.log(invoice.number, "-", invoice.totalCents / 100, invoice.currency);
  console.log("  Hosted:", invoice.hostedUrl);
  console.log("  Invoice PDF:", invoice.invoicePdfUrl);
  console.log("  Receipt PDF:", invoice.receiptPdfUrl);
}`}</CodeBlock>

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
