import type { Metadata } from "next";

export const metadata: Metadata = { title: "Self-Hosting" };

export default function SelfHosting() {
  return (
    <>
      <h1 className="text-[30px] font-semibold tracking-[-0.6px]">
        Self-Hosting
      </h1>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4 mt-4">
        Paylix is fully open-source and designed to be self-hosted. Run your own
        instance with Docker Compose in under 10 minutes.
      </p>

      {/* ── Prerequisites ──────────────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        Prerequisites
      </h2>
      <ul className="text-sm text-[#94a3b8] leading-relaxed mb-4 list-disc pl-5 space-y-2">
        <li>Docker and Docker Compose installed</li>
        <li>A domain name (for HTTPS and webhooks)</li>
        <li>
          An Ethereum wallet with a private key (for the indexer/keeper to
          process subscription charges)
        </li>
        <li>A Base RPC URL (Alchemy, Infura, or public RPC)</li>
      </ul>

      {/* ── Step 1: Clone ──────────────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        1. Clone the Repository
      </h2>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`git clone https://github.com/paylix/paylix.git
cd paylix`}
      </pre>

      {/* ── Step 2: Environment ────────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        2. Configure Environment
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Copy the example environment file and fill in your values.
      </p>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`cp .env.example .env`}
      </pre>
      <h3 className="text-base font-medium mt-8 mb-3">
        Required Environment Variables
      </h3>
      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="border-b border-[rgba(148,163,184,0.12)] text-left text-[#94a3b8]">
            <th className="pb-2 font-medium">Variable</th>
            <th className="pb-2 font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="text-[#f0f0f3]">
          <tr className="border-b border-[rgba(148,163,184,0.06)]">
            <td className="py-2 font-mono text-[13px] text-[#06d6a0]">DATABASE_URL</td>
            <td className="py-2 text-[#94a3b8]">PostgreSQL connection string. Use the Docker Compose default or your own database.</td>
          </tr>
          <tr className="border-b border-[rgba(148,163,184,0.06)]">
            <td className="py-2 font-mono text-[13px] text-[#06d6a0]">BETTER_AUTH_SECRET</td>
            <td className="py-2 text-[#94a3b8]">Random secret for authentication sessions. Generate with <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">openssl rand -hex 32</code>.</td>
          </tr>
          <tr className="border-b border-[rgba(148,163,184,0.06)]">
            <td className="py-2 font-mono text-[13px] text-[#06d6a0]">BETTER_AUTH_URL</td>
            <td className="py-2 text-[#94a3b8]">Public URL of your Paylix instance (e.g. <code className="bg-[#111116] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#06d6a0]">https://paylix.example.com</code>).</td>
          </tr>
          <tr className="border-b border-[rgba(148,163,184,0.06)]">
            <td className="py-2 font-mono text-[13px] text-[#06d6a0]">RPC_URL</td>
            <td className="py-2 text-[#94a3b8]">Base mainnet RPC URL (e.g. from Alchemy or Infura).</td>
          </tr>
          <tr className="border-b border-[rgba(148,163,184,0.06)]">
            <td className="py-2 font-mono text-[13px] text-[#06d6a0]">KEEPER_PRIVATE_KEY</td>
            <td className="py-2 text-[#94a3b8]">Private key for the keeper wallet that processes subscription charges. Fund with a small amount of ETH for gas.</td>
          </tr>
          <tr className="border-b border-[rgba(148,163,184,0.06)]">
            <td className="py-2 font-mono text-[13px] text-[#06d6a0]">PAYMENT_CONTRACT_ADDRESS</td>
            <td className="py-2 text-[#94a3b8]">Address of the deployed Paylix payment contract.</td>
          </tr>
          <tr className="border-b border-[rgba(148,163,184,0.06)]">
            <td className="py-2 font-mono text-[13px] text-[#06d6a0]">SUBSCRIPTION_CONTRACT_ADDRESS</td>
            <td className="py-2 text-[#94a3b8]">Address of the deployed Paylix subscription contract.</td>
          </tr>
        </tbody>
      </table>

      {/* ── Step 3: Docker Compose ─────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        3. Start with Docker Compose
      </h2>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`# Start all services
docker compose up -d

# This starts:
#   - PostgreSQL database
#   - Paylix web dashboard + API
#   - Blockchain indexer + keeper`}
      </pre>

      {/* ── Step 4: Migrate ────────────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        4. Run Database Migrations
      </h2>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`# Push schema to database
docker compose exec web pnpm --filter @paylix/db db:push`}
      </pre>

      {/* ── Step 5: Access ─────────────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        5. Access the Dashboard
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        Open your browser and navigate to your configured URL. Create your first
        account, add a product, and generate API keys.
      </p>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`# Default local URL
http://localhost:3000`}
      </pre>

      {/* ── Reverse Proxy ──────────────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        6. Set Up a Reverse Proxy (Production)
      </h2>
      <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">
        For production, place Paylix behind a reverse proxy with TLS. Here is an
        example Caddy configuration:
      </p>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`# Caddyfile
paylix.example.com {
  reverse_proxy localhost:3000
}`}
      </pre>

      {/* ── Updating ───────────────────────────────────── */}
      <h2 className="text-xl font-semibold tracking-[-0.4px] mt-12 mb-4">
        Updating
      </h2>
      <pre className="bg-[#111116] border border-[rgba(148,163,184,0.12)] rounded-lg p-4 text-[13px] font-mono text-[#f0f0f3] overflow-x-auto mb-6">
{`git pull origin main
docker compose down
docker compose up -d --build
docker compose exec web pnpm --filter @paylix/db db:push`}
      </pre>
    </>
  );
}
