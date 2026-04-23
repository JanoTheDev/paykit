# Solana integration

**Status:** Draft — program + indexer skeletons landed, live implementation pending
**Date:** 2026-04-23
**Issue:** #57

## Motivation

Solana is the most-used non-EVM L1 by active wallets and daily transfer
volume. USDC, USDT, and PYUSD all have canonical SPL deployments. Adding
Solana unlocks a large merchant + buyer population that currently can't
use Paylix at all.

## Why this is a separate package stack

Nothing in the EVM code path ports directly:

| EVM world                    | Solana equivalent                          |
|------------------------------|--------------------------------------------|
| Solidity + Foundry           | Rust + Anchor                              |
| viem + wagmi                 | @solana/web3.js + wallet-adapter-react     |
| EIP-2612 permit              | SPL Token `approve` → delegate authority   |
| EIP-712 signatures           | Ed25519 over canonical struct              |
| Events via `emit`            | `emit!` macro → `connection.onLogs`        |
| Addresses: 20-byte hex       | Base58 Ed25519 pubkey                      |
| Confirmations = N blocks     | Commitment levels (processed/confirmed/finalized) |
| Gas = ETH                    | Fee = SOL (paid by fee payer ≈ relayer)    |

## Packages added by this project

```
packages/
  solana-program/                — Anchor workspace
    programs/
      paylix_payment_vault/      — one-time SPL payments
      paylix_subscription_manager/ — recurring SPL subscriptions
    tests/
    Anchor.toml
    Cargo.toml
  solana-indexer/                — Node indexer + keeper
    src/index.ts
    src/listener.ts
    src/keeper.ts
```

Scaffolds landed in this PR with `declare_id!` placeholders + instruction
signatures + account structs. Implementation of the actual logic is tracked
in a follow-up PR referenced from issue #57.

## Design principles (same as EVM, adapted)

1. **Non-custodial.** Paylix never holds tokens. All transfers CPI through
   the SPL Token program using the buyer's delegate authority.
2. **Intent-bound.** The buyer signs a Paylix PaymentIntent / SubscriptionIntent
   committing to the exact merchant + amount + token. The program verifies
   ed25519 over the canonical layout before any transfer.
3. **Single-contract-per-program.** One Anchor program per payment kind,
   one program ID per deployment. Operators can redeploy independently.
4. **Reorg safety.** Listener reads at `finalized` commitment; an opt-in
   `SOLANA_COMMITMENT=confirmed` env var accepts faster latency at higher
   risk. Never `processed`.

## Subscription model — SPL delegate authority

Buyer calls SPL Token's `approve` once at subscription creation, naming
the SubscriptionManager program's PDA as delegate for `amount × cycles`.
The keeper then CPIs into `spl-token::transfer_checked` on schedule using
the delegate authority. Cancellation = `revoke`.

Difference vs EVM Permit2: Solana's delegate is allowance-bound and
mint-scoped (not program-scoped), so a buyer can have at most one delegate
per mint. Paylix uses the SubscriptionManager PDA as the single delegate;
buyers with multiple Paylix subscriptions share the allowance pool. Merchants
see this as a potential failure mode if a buyer subscribes to two products
with a combined allowance exceeding what they preset — an implementation
detail covered in the #57 follow-up.

## Tokens (initial)

- USDC: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- USDT: `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`
- PYUSD (Token-2022): `2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo`

The program uses `anchor_spl::token_interface` which accepts both classic
SPL Token and Token-2022 mints, so PYUSD works without branching.

## Registry integration

`packages/config/src/networks/` gains `solana.ts` + `solana-devnet.ts`
files in the #57 follow-up. They don't use `viemChain` (irrelevant for
Solana) — the registry type adds an optional `solanaCluster` field for
non-EVM descriptors.

## Env vars (new)

```
SOLANA_RPC_URL=...
SOLANA_WS_URL=...
SOLANA_KEEPER_KEYPAIR_PATH=~/.config/solana/keeper.json
SOLANA_RELAYER_KEYPAIR_PATH=~/.config/solana/relayer.json
SOLANA_PAYMENT_VAULT_PROGRAM_ID=PLXPayVau1t...
SOLANA_SUBSCRIPTION_MANAGER_PROGRAM_ID=PLXSubMan1...
SOLANA_COMMITMENT=finalized
```

## Dashboard changes

Settings payout-wallet input for Solana accepts a base58 pubkey with
regex `^[1-9A-HJ-NP-Za-km-z]{32,44}$`. Checkout client uses
`@solana/wallet-adapter-react` (Phantom / Backpack / Solflare) when the
session's chain is Solana.

## Deploy

`./deploy.sh solana devnet` and `./deploy.sh solana mainnet` route to
`deploy/solana.sh`, which runs `anchor build && anchor deploy` and writes
the program IDs back to `.env`.

## Non-goals

- Subscriptions using witness-style pre-signed transactions (fragile, out
  of scope; delegate authority is the standard Solana recipe)
- SPL governance integration
- cNFTs / compressed token support
- Wormhole bridging

## Open decisions

- **Platform fee split via single-tx multi-transfer**: possible on Solana
  and preferred over the EVM path's brief-custody model. Implementation PR
  will do this.
- **Priority fees**: mainnet-beta competes on priority fees; the keeper's
  charge loop will set `compute_budget` instructions. Magnitude to be
  benchmarked under load.
