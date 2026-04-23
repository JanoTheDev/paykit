# Paylix

> Open-source crypto payments infrastructure. Accept one-time and recurring crypto payments across 7 EVM chains (and more coming), with gasless checkout and non-custodial settlement.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

## What is Paylix?

Self-hostable payments stack for one-time and recurring crypto billing:

- TypeScript SDK (`@paylix/sdk`)
- Hosted checkout + merchant dashboard (Next.js)
- On-chain settlement contracts (Foundry — Solidity)
- Indexer + keeper for event sync and subscription charging
- Multi-chain registry + deploy tooling

Designed to replace Stripe-like subscription billing with crypto-native
settlement — without custody, without sending funds through an intermediary,
and without requiring buyers to hold gas.

## Supported chains and coins

Live at the code level; per-chain mainnet deploys require the operator to
fund a deployer wallet and run `./deploy.sh <chain> mainnet`.

| Chain              | Testnet                  | Mainnet | USDC | USDT | DAI  | WETH | WBTC | PYUSD |
|--------------------|--------------------------|---------|------|------|------|------|------|-------|
| Ethereum           | Sepolia                  | ✅      | ✅   | ✅   | ✅*  | ✅†  | ✅†  | ✅    |
| Base               | Base Sepolia             | ✅      | ✅   | —    | ✅   | ✅   | —    | —     |
| Arbitrum One       | Arbitrum Sepolia         | ✅      | ✅   | ✅   | ✅   | ✅   | ✅   | —     |
| Optimism           | OP Sepolia               | ✅      | ✅   | ✅   | ✅   | ✅   | ✅   | —     |
| Polygon PoS        | Polygon Amoy             | ✅      | ✅   | ✅   | ✅   | ✅†  | ✅   | —     |
| BNB Chain          | BNB Testnet              | ✅      | ✅†‡ | ✅†  | ✅†  | ✅†  | —    | —     |
| Avalanche C-Chain  | Avalanche Fuji           | ✅      | ✅   | ✅   | ✅†  | ✅†  | ✅   | —     |

`*` Ethereum DAI uses the legacy DAI-permit variant
`†` Bridged token (flagged in UI as non-canonical)
`‡` BNB USDC (Binance-Peg) is 18-decimal and inert pending Permit2 wiring (#56)

Non-EVM chains (scaffolded, live implementation tracked in open issues):

| Chain     | Testnet     | Mainnet | Model           | Subscriptions |
|-----------|-------------|---------|-----------------|---------------|
| Solana    | Devnet      | Scaffold | SPL + Anchor    | ✅ (delegate authority) |
| Bitcoin   | Testnet     | Scaffold | UTXO watch-addr  | ❌ (no on-chain auth)   |
| Litecoin  | Testnet     | Scaffold | UTXO watch-addr  | ❌ (no on-chain auth)   |

## Non-custodial by design

- Customer funds transfer on-chain **directly from buyer wallet to merchant wallet**
- Paylix never holds user balances in intermediary wallets
- The platform fee (if enabled) is split during the same on-chain payment
- Gasless flows still settle directly — the relayer pays gas, not custody

## Quick start (SDK)

```bash
npm install @paylix/sdk
```

```ts
import { Paylix } from "@paylix/sdk";

const paylix = new Paylix({
  apiKey: "sk_test_...",
  network: "base-sepolia",  // any supported network key
  backendUrl: "http://localhost:3000",
});

const { checkoutUrl } = await paylix.createCheckout({
  productId: "prod_abc",
  customerId: "user_123",
  successUrl: "https://myapp.com/success",
  cancelUrl: "https://myapp.com/cancel",
});

// Redirect the buyer. Hosted checkout handles wallet + signatures.
```

Subscriptions use the same shape:

```ts
const { checkoutUrl } = await paylix.createSubscription({
  productId: "prod_monthly",
  customerId: "user_123",
  successUrl: "https://myapp.com/success",
  cancelUrl: "https://myapp.com/cancel",
});
```

## Gasless checkout

Buyers never need gas to pay. The hosted checkout takes two signatures:

1. **EIP-2612 permit** (or Uniswap Permit2 for non-permit tokens like USDT /
   DAI / WETH) — authorises the vault to pull exactly the amount of tokens
   the checkout needs
2. **Paylix `PaymentIntent`** (or `SubscriptionIntent`) — EIP-712 binding to
   the exact merchant + amount + nonce so a compromised relayer cannot
   redirect funds

The relayer submits the transaction and pays gas. The contract's
`_consumePaymentIntent` runs **before** `safeTransferFrom` — this is the
invariant that makes the design non-catastrophic against a compromised relay.

## Core features

- **One-time payments** on every supported chain/token pair
- **Subscriptions** with keeper-driven recurring charges (EIP-2612 + Permit2)
- **Free trials** with trialing and trial-conversion lifecycle states
- **Refunds** (full and partial, merchant-initiated or customer-requested)
- **Coupons** (one-off, repeating, and forever discounts)
- **Gasless checkout** via relayer (no ETH required for buyers)
- **Multi-wallet customers** (primary + backup payers for subscription resilience)
- **Tax collection** (EU VAT, US state headline rates)
- **Invoices + receipts** (hosted pages + on-demand PDF)
- **Webhooks** for payment and subscription lifecycle events
- **Customer portal** (view history, manage subs, add wallets)
- **Dashboard + checkout links** (no-code launches)
- **Testnet + mainnet parity** on every supported chain
- **Self-hosting** with Docker Compose, full data ownership

## Monorepo layout

```
apps/
  web/            Next.js dashboard + API + checkout
  docs/           Next.js docs site

packages/
  sdk/            @paylix/sdk
  contracts/      Solidity (PaymentVault, SubscriptionManager, MockUSDC)
  db/             Drizzle schema + migrations
  indexer/        EVM event listener + subscription keeper
  mailer/         Invoice email delivery
  config/         Network registry (7 EVM chains) + tsconfig utilities
  utxo-watcher/   Bitcoin + Litecoin UTXO watch-address service (skeleton)
  solana-program/ Anchor workspace (payment_vault + subscription_manager)
  solana-indexer/ Solana log listener + keeper (skeleton)
```

## Self-hosting

See **[SELFHOST.md](SELFHOST.md)** for the full guide.

Quick version:

```bash
# 1. Clone + install
git clone https://github.com/JanoTheDev/paylix.git && cd paylix
cp .env.example .env                 # fill in keys (see SELFHOST)
pnpm install

# 2. Deploy contracts on your chain of choice
# (deploy.sh lives outside the repo — copy it up one level first)
./deploy.sh base testnet             # or any chain × testnet/mainnet

# 3. Start everything
docker compose up -d
pnpm --filter @paylix/web dev
pnpm --filter @paylix/indexer dev
```

### Deploying to a new chain

`./deploy.sh <chain> <testnet|mainnet>` handles everything:

```
./deploy.sh ethereum testnet         # Ethereum Sepolia
./deploy.sh arbitrum mainnet         # Arbitrum One
./deploy.sh all testnet              # fan out to every configured chain
./deploy.sh base testnet --mint-only 0xYourBuyer 1000000000  # faucet test USDC
```

Testnet and mainnet deployer / relayer / keeper / platform wallets are
**separate** — `TESTNET_*` and `MAINNET_*` env groups enforce the split.

## Local development

```bash
pnpm install
docker compose up -d postgres
pnpm --filter @paylix/db db:push
pnpm dev                              # all apps + packages via turbo
```

## Testing

```bash
pnpm test                             # all packages (527+ tests)
pnpm --filter @paylix/sdk test        # single package
pnpm --filter @paylix/config test     # network registry
pnpm --filter @paylix/utxo-watcher test
```

Solidity / Foundry tests run under WSL on Windows:

```bash
wsl bash -lc "cd /mnt/c/path/to/paykit/packages/contracts && ~/.foundry/bin/forge test"
```

Anchor (Solana) tests need `anchor-cli` installed:

```bash
cd packages/solana-program && anchor test
```

## Rollout status

The multi-chain rollout (tracker #28 + #54–#65) is **fully closed**. Every
EVM chain, token, signature scheme, and non-EVM scaffold is landed.

What buyers can pay with today via the hosted checkout:

| Scheme       | Tokens                         | One-time | Subscriptions |
|--------------|--------------------------------|----------|---------------|
| EIP-2612     | USDC (all EVM mainnets), PYUSD | ✅       | ✅            |
| Permit2      | USDT, WETH, WBTC, bridged DAI  | ✅       | ✅            |
| DAI-permit   | DAI on Ethereum mainnet        | ✅       | —             |
| SPL delegate | USDC / USDT / PYUSD on Solana  | ✅       | ✅ (scaffold)  |
| UTXO watch   | BTC, LTC                       | ✅       | — (model)     |

Everything above is wired end-to-end for EVM (checkout client → relay →
contract). Non-EVM (Solana / Bitcoin / Litecoin) has contract/program/
service implementations; operator deploys + Postgres writer plug-in to
complete. Writer interfaces are callback-based so you can drop Drizzle or
any other ORM in without changing the packages.

## Architecture deep-dive

- [CLAUDE.md](CLAUDE.md) — architecture, invariants, gotchas
- [docs/superpowers/specs/](docs/superpowers/specs/) — design specs for each major feature
- [docs/superpowers/specs/2026-04-11-multi-chain-multi-token-design.md](docs/superpowers/specs/2026-04-11-multi-chain-multi-token-design.md) — multi-chain architecture
- [docs/superpowers/specs/2026-04-23-bitcoin-integration.md](docs/superpowers/specs/2026-04-23-bitcoin-integration.md) — UTXO watcher design
- [docs/superpowers/specs/2026-04-23-solana-integration.md](docs/superpowers/specs/2026-04-23-solana-integration.md) — Solana / Anchor design

## License

[AGPL-3.0](LICENSE) — Free to use, self-host, modify. If you offer a modified
version as a hosted service, you must open-source your changes.
