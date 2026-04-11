import type { Metadata } from "next";
import {
  Callout,
  CodeBlock,
  DocTable,
  DocTableBody,
  DocTableCell,
  DocTableRow,
  PageHeading,
  SectionHeading,
} from "@/components/docs";

export const metadata: Metadata = { title: "Testnet Setup" };

export default function TestnetSetup() {
  return (
    <>
      <PageHeading
        title="Testnet Setup"
        description="Test your Paylix integration on Base Sepolia before going live. Testnet uses MockUSDC so you can develop without spending real funds."
      />

      <Callout variant="tip" title="Get test ETH first">
        Every step below requires a small amount of Base Sepolia ETH for gas.
        Grab some from the{" "}
        <a
          href="https://portal.cdp.coinbase.com/products/faucet"
          className="underline hover:text-foreground"
          target="_blank"
          rel="noopener noreferrer"
        >
          Coinbase Base Sepolia faucet
        </a>{" "}
        before you start — most wallet errors at checkout are really
        &quot;out of gas&quot; errors in disguise.
      </Callout>

      <SectionHeading>1. Configure the SDK for Testnet</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Set{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
          network
        </code>{" "}
        to{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
          &quot;base-sepolia&quot;
        </code>{" "}
        and use a test API key (
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
          sk_test_...
        </code>
        ).
      </p>
      <CodeBlock language="ts">{`import { Paylix } from "@paylix/sdk";

const paylix = new Paylix({
  apiKey: "sk_test_...",
  network: "base-sepolia",
  backendUrl: "http://localhost:3000",  // or your staging URL
});`}</CodeBlock>

      <SectionHeading>2. Get Test ETH on Base Sepolia</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        You need a small amount of ETH on Base Sepolia for gas fees. Use a
        faucet to get test ETH:
      </p>
      <ul className="mt-4 space-y-2 pl-5 text-sm leading-relaxed text-foreground-muted [&>li]:list-disc">
        <li>
          <strong className="text-foreground">Coinbase Faucet:</strong>{" "}
          <a
            href="https://portal.cdp.coinbase.com/products/faucet"
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            portal.cdp.coinbase.com/products/faucet
          </a>
        </li>
        <li>
          <strong className="text-foreground">Alchemy Faucet:</strong>{" "}
          <a
            href="https://www.alchemy.com/faucets/base-sepolia"
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            alchemy.com/faucets/base-sepolia
          </a>
        </li>
      </ul>

      <SectionHeading>3. Add Base Sepolia to Your Wallet</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Add the Base Sepolia network to MetaMask or your preferred wallet:
      </p>
      <DocTable>
        <DocTableBody>
          <DocTableRow>
            <DocTableCell>
              <span className="text-foreground-muted">Network Name</span>
            </DocTableCell>
            <DocTableCell mono>Base Sepolia</DocTableCell>
          </DocTableRow>
          <DocTableRow>
            <DocTableCell>
              <span className="text-foreground-muted">RPC URL</span>
            </DocTableCell>
            <DocTableCell mono>https://sepolia.base.org</DocTableCell>
          </DocTableRow>
          <DocTableRow>
            <DocTableCell>
              <span className="text-foreground-muted">Chain ID</span>
            </DocTableCell>
            <DocTableCell mono>84532</DocTableCell>
          </DocTableRow>
          <DocTableRow>
            <DocTableCell>
              <span className="text-foreground-muted">Currency Symbol</span>
            </DocTableCell>
            <DocTableCell mono>ETH</DocTableCell>
          </DocTableRow>
          <DocTableRow>
            <DocTableCell>
              <span className="text-foreground-muted">Block Explorer</span>
            </DocTableCell>
            <DocTableCell mono>https://sepolia.basescan.org</DocTableCell>
          </DocTableRow>
        </DocTableBody>
      </DocTable>

      <SectionHeading>4. Get MockUSDC Tokens</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Paylix deploys a MockUSDC contract on Base Sepolia for testing. You
        can mint test tokens directly from the contract.
      </p>
      <CodeBlock language="bash">{`# Mint MockUSDC using cast (Foundry)
cast send <MOCK_USDC_ADDRESS> \\
  "mint(address,uint256)" \\
  <YOUR_WALLET> 1000000000 \\
  --rpc-url https://sepolia.base.org \\
  --private-key <YOUR_PRIVATE_KEY>

# This mints 1000 USDC (6 decimals: 1000 * 10^6 = 1000000000)`}</CodeBlock>
      <p className="text-sm leading-relaxed text-foreground-muted">
        You can also mint MockUSDC from the Paylix dashboard under{" "}
        <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
          Settings → Testnet Tools
        </code>
        .
      </p>

      <SectionHeading>5. Test a Checkout</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Create a test product in the dashboard, then run a checkout flow:
      </p>
      <CodeBlock language="ts">{`const { checkoutUrl } = await paylix.createCheckout({
  productId: "prod_test_123",
  successUrl: "http://localhost:3001/success",
  cancelUrl: "http://localhost:3001/cancel",
});

// Open the checkout URL in your browser
console.log("Checkout:", checkoutUrl);`}</CodeBlock>

      <SectionHeading>6. Verify the Test Payment</SectionHeading>
      <CodeBlock language="ts">{`const result = await paylix.verifyPayment({
  paymentId: "pay_test_abc",
});

console.log("Verified:", result.verified);
console.log("Chain:", result.chain);  // "base-sepolia"
console.log("Tx:", result.txHash);    // View on sepolia.basescan.org`}</CodeBlock>

      <SectionHeading>Going Live</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        When you are ready to accept real payments, update your configuration:
      </p>
      <ul className="mt-4 space-y-2 pl-5 text-sm leading-relaxed text-foreground-muted [&>li]:list-disc">
        <li>
          Change{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
            network
          </code>{" "}
          from{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
            &quot;base-sepolia&quot;
          </code>{" "}
          to{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
            &quot;base&quot;
          </code>
        </li>
        <li>
          Replace{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
            sk_test_...
          </code>{" "}
          with{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
            sk_live_...
          </code>
        </li>
        <li>
          Point{" "}
          <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
            backendUrl
          </code>{" "}
          to your production Paylix instance
        </li>
        <li>
          Update your production wallet address in the dashboard profile —
          it&apos;s used automatically for every checkout created with your
          secret key
        </li>
      </ul>
    </>
  );
}
