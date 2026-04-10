import type { Metadata } from "next";

export const metadata: Metadata = { title: "Testnet Setup" };

export default function TestnetSetup() {
  return (
    <>
      <h1 className="text-[30px] font-semibold tracking-[-0.6px]">
        Testnet Setup
      </h1>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4 mt-4">
        Test your Paylix integration on Base Sepolia before going live. Testnet
        uses MockUSDC so you can develop without spending real funds.
      </p>

      {/* ── Step 1: Configure SDK ──────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        1. Configure the SDK for Testnet
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Set{" "}
        <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
          network
        </code>{" "}
        to{" "}
        <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
          &quot;base-sepolia&quot;
        </code>{" "}
        and use a test API key (
        <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
          sk_test_...
        </code>
        ).
      </p>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`import { Paylix } from "@paylix/sdk";

const paylix = new Paylix({
  apiKey: "sk_test_...",
  network: "base-sepolia",
  merchantWallet: "0xYourTestWallet",
  backendUrl: "http://localhost:3000",  // or your staging URL
});`}
      </pre>

      {/* ── Step 2: Get test ETH ───────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        2. Get Test ETH on Base Sepolia
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        You need a small amount of ETH on Base Sepolia for gas fees. Use a
        faucet to get test ETH:
      </p>
      <ul className="text-sm text-[#94a3b8] leading-relaxed mb-4 list-disc pl-5 space-y-2">
        <li>
          <strong className="text-[#f0f0f3]">Coinbase Faucet:</strong>{" "}
          <a
            href="https://portal.cdp.coinbase.com/products/faucet"
            className="text-[#06d6a0] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            portal.cdp.coinbase.com/products/faucet
          </a>
        </li>
        <li>
          <strong className="text-[#f0f0f3]">Alchemy Faucet:</strong>{" "}
          <a
            href="https://www.alchemy.com/faucets/base-sepolia"
            className="text-[#06d6a0] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            alchemy.com/faucets/base-sepolia
          </a>
        </li>
      </ul>

      {/* ── Step 3: Add Base Sepolia to wallet ─────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        3. Add Base Sepolia to Your Wallet
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Add the Base Sepolia network to MetaMask or your preferred wallet:
      </p>
      <table className="w-full text-sm mb-6">
        <tbody className="text-[#f0f0f3]">
          <tr className="border-b border-[rgba(148,163,184,0.06)]">
            <td className="py-2 text-[#94a3b8]">Network Name</td>
            <td className="py-2 font-mono text-[13px]">Base Sepolia</td>
          </tr>
          <tr className="border-b border-[rgba(148,163,184,0.06)]">
            <td className="py-2 text-[#94a3b8]">RPC URL</td>
            <td className="py-2 font-mono text-[13px]">https://sepolia.base.org</td>
          </tr>
          <tr className="border-b border-[rgba(148,163,184,0.06)]">
            <td className="py-2 text-[#94a3b8]">Chain ID</td>
            <td className="py-2 font-mono text-[13px]">84532</td>
          </tr>
          <tr className="border-b border-[rgba(148,163,184,0.06)]">
            <td className="py-2 text-[#94a3b8]">Currency Symbol</td>
            <td className="py-2 font-mono text-[13px]">ETH</td>
          </tr>
          <tr className="border-b border-[rgba(148,163,184,0.06)]">
            <td className="py-2 text-[#94a3b8]">Block Explorer</td>
            <td className="py-2 font-mono text-[13px]">https://sepolia.basescan.org</td>
          </tr>
        </tbody>
      </table>

      {/* ── Step 4: Get MockUSDC ───────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        4. Get MockUSDC Tokens
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Paylix deploys a MockUSDC contract on Base Sepolia for testing. You can
        mint test tokens directly from the contract.
      </p>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`// Mint MockUSDC using cast (Foundry)
cast send <MOCK_USDC_ADDRESS> \\
  "mint(address,uint256)" \\
  <YOUR_WALLET> 1000000000 \\
  --rpc-url https://sepolia.base.org \\
  --private-key <YOUR_PRIVATE_KEY>

# This mints 1000 USDC (6 decimals: 1000 * 10^6 = 1000000000)`}
      </pre>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        You can also mint MockUSDC from the Paylix dashboard under{" "}
        <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
          Settings &rarr; Testnet Tools
        </code>
        .
      </p>

      {/* ── Step 5: Test a Checkout ────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        5. Test a Checkout
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Create a test product in the dashboard, then run a checkout flow:
      </p>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`const { checkoutUrl } = await paylix.createCheckout({
  productId: "prod_test_123",
  successUrl: "http://localhost:3001/success",
  cancelUrl: "http://localhost:3001/cancel",
});

// Open the checkout URL in your browser
console.log("Checkout:", checkoutUrl);`}
      </pre>

      {/* ── Step 6: Verify Payment ─────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        6. Verify the Test Payment
      </h2>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`const result = await paylix.verifyPayment({
  paymentId: "pay_test_abc",
});

console.log("Verified:", result.verified);
console.log("Chain:", result.chain);  // "base-sepolia"
console.log("Tx:", result.txHash);    // View on sepolia.basescan.org`}
      </pre>

      {/* ── Going Live ─────────────────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        Going Live
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        When you are ready to accept real payments, update your configuration:
      </p>
      <ul className="text-sm text-[#94a3b8] leading-relaxed mb-4 list-disc pl-5 space-y-2">
        <li>
          Change{" "}
          <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
            network
          </code>{" "}
          from{" "}
          <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
            &quot;base-sepolia&quot;
          </code>{" "}
          to{" "}
          <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
            &quot;base&quot;
          </code>
        </li>
        <li>
          Replace{" "}
          <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
            sk_test_...
          </code>{" "}
          with{" "}
          <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
            sk_live_...
          </code>
        </li>
        <li>
          Point{" "}
          <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
            backendUrl
          </code>{" "}
          to your production Paylix instance
        </li>
        <li>
          Update{" "}
          <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">
            merchantWallet
          </code>{" "}
          to your production wallet address
        </li>
      </ul>
    </>
  );
}
