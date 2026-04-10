import type { Metadata } from "next";
import {
  Callout,
  CodeBlock,
  DocTable,
  DocTableBody,
  DocTableCell,
  DocTableHead,
  DocTableHeader,
  DocTableRow,
  PageHeading,
  SectionHeading,
  SubsectionHeading,
} from "@/components/docs";

export const metadata: Metadata = { title: "Self-Hosting" };

export default function SelfHosting() {
  return (
    <>
      <PageHeading
        title="Self-Hosting"
        description="Paylix is fully open-source and designed to be self-hosted. Run your own instance with Docker Compose in under 10 minutes."
      />

      <Callout variant="info" title="What runs where">
        A Paylix deployment is three cooperating processes: the Next.js
        dashboard/API, a PostgreSQL database, and the indexer/keeper. The
        indexer must stay online — it is what watches the blockchain and
        charges subscriptions. If it goes down, payments stop settling in your
        dashboard.
      </Callout>

      <SectionHeading>Prerequisites</SectionHeading>
      <ul className="mt-4 space-y-2 pl-5 text-sm leading-relaxed text-foreground-muted [&>li]:list-disc">
        <li>Docker and Docker Compose installed</li>
        <li>A domain name (for HTTPS and webhooks)</li>
        <li>
          An Ethereum wallet with a private key (for the indexer/keeper to
          process subscription charges)
        </li>
        <li>A Base RPC URL (Alchemy, Infura, or public RPC)</li>
      </ul>

      <SectionHeading>1. Clone the Repository</SectionHeading>
      <CodeBlock language="bash">{`git clone https://github.com/paylix/paylix.git
cd paylix`}</CodeBlock>

      <SectionHeading>2. Configure Environment</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Copy the example environment file and fill in your values.
      </p>
      <CodeBlock language="bash">{`cp .env.example .env`}</CodeBlock>

      <SubsectionHeading>Required Environment Variables</SubsectionHeading>
      <DocTable>
        <DocTableHead>
          <DocTableRow>
            <DocTableHeader>Variable</DocTableHeader>
            <DocTableHeader>Description</DocTableHeader>
          </DocTableRow>
        </DocTableHead>
        <DocTableBody>
          <DocTableRow>
            <DocTableCell mono>
              <span className="text-foreground">DATABASE_URL</span>
            </DocTableCell>
            <DocTableCell>
              <span className="text-foreground-muted">
                PostgreSQL connection string. Use the Docker Compose default or
                your own database.
              </span>
            </DocTableCell>
          </DocTableRow>
          <DocTableRow>
            <DocTableCell mono>
              <span className="text-foreground">BETTER_AUTH_SECRET</span>
            </DocTableCell>
            <DocTableCell>
              <span className="text-foreground-muted">
                Random secret for authentication sessions. Generate with{" "}
                <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
                  openssl rand -hex 32
                </code>
                .
              </span>
            </DocTableCell>
          </DocTableRow>
          <DocTableRow>
            <DocTableCell mono>
              <span className="text-foreground">BETTER_AUTH_URL</span>
            </DocTableCell>
            <DocTableCell>
              <span className="text-foreground-muted">
                Public URL of your Paylix instance (e.g.{" "}
                <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px] text-primary">
                  https://paylix.example.com
                </code>
                ).
              </span>
            </DocTableCell>
          </DocTableRow>
          <DocTableRow>
            <DocTableCell mono>
              <span className="text-foreground">RPC_URL</span>
            </DocTableCell>
            <DocTableCell>
              <span className="text-foreground-muted">
                Base mainnet RPC URL (e.g. from Alchemy or Infura).
              </span>
            </DocTableCell>
          </DocTableRow>
          <DocTableRow>
            <DocTableCell mono>
              <span className="text-foreground">KEEPER_PRIVATE_KEY</span>
            </DocTableCell>
            <DocTableCell>
              <span className="text-foreground-muted">
                Private key for the keeper wallet that processes subscription
                charges. Fund with a small amount of ETH for gas.
              </span>
            </DocTableCell>
          </DocTableRow>
          <DocTableRow>
            <DocTableCell mono>
              <span className="text-foreground">PAYMENT_CONTRACT_ADDRESS</span>
            </DocTableCell>
            <DocTableCell>
              <span className="text-foreground-muted">
                Address of the deployed Paylix payment contract.
              </span>
            </DocTableCell>
          </DocTableRow>
          <DocTableRow>
            <DocTableCell mono>
              <span className="text-foreground">
                SUBSCRIPTION_CONTRACT_ADDRESS
              </span>
            </DocTableCell>
            <DocTableCell>
              <span className="text-foreground-muted">
                Address of the deployed Paylix subscription contract.
              </span>
            </DocTableCell>
          </DocTableRow>
        </DocTableBody>
      </DocTable>

      <SectionHeading>3. Start with Docker Compose</SectionHeading>
      <CodeBlock language="bash">{`# Start all services
docker compose up -d

# This starts:
#   - PostgreSQL database
#   - Paylix web dashboard + API
#   - Blockchain indexer + keeper`}</CodeBlock>

      <SectionHeading>4. Run Database Migrations</SectionHeading>
      <CodeBlock language="bash">{`# Push schema to database
docker compose exec web pnpm --filter @paylix/db db:push`}</CodeBlock>

      <SectionHeading>5. Access the Dashboard</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        Open your browser and navigate to your configured URL. Create your
        first account, add a product, and generate API keys.
      </p>
      <CodeBlock language="bash">{`# Default local URL
http://localhost:3000`}</CodeBlock>

      <SectionHeading>6. Set Up a Reverse Proxy (Production)</SectionHeading>
      <p className="text-sm leading-relaxed text-foreground-muted">
        For production, place Paylix behind a reverse proxy with TLS. Here is
        an example Caddy configuration:
      </p>
      <CodeBlock language="bash">{`paylix.example.com {
  reverse_proxy localhost:3000
}`}</CodeBlock>

      <SectionHeading>Updating</SectionHeading>
      <CodeBlock language="bash">{`git pull origin main
docker compose down
docker compose up -d --build
docker compose exec web pnpm --filter @paylix/db db:push`}</CodeBlock>
    </>
  );
}
