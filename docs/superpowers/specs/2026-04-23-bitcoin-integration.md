# Bitcoin (and Litecoin) integration

**Status:** Draft — implementation stubs landed, live Electrum wiring pending
**Date:** 2026-04-23
**Issues:** #58 (Bitcoin), #59 (Litecoin)

## Why this is a different model

Bitcoin has no smart contracts. No permit. No delegation. No pre-authorized
pulls. The entire Paylix subscription value prop — one signature, recurring
auto-charge — cannot be replicated honestly on a UTXO chain because there
is no equivalent of an ERC-20 allowance to draw from.

This spec covers **one-time payments only**. Subscriptions on Bitcoin /
Litecoin are explicitly out of scope and the merchant dashboard rejects
subscription-type products on those chains.

## Architecture

```
                                   ┌──────────────────────┐
 Merchant enters xpub  ───────────▶│ apps/web              │
 in dashboard Settings             │  settings/payments    │
                                   └──────────┬───────────┘
                                              │ store xpub + chain in DB
                                              ▼
 Customer opens checkout ─────────▶ apps/web ─┬──────────▶ Derive fresh
                                              │            BIP44 address
                                              ▼
                                   ┌──────────────────────┐
                                   │ @paylix/utxo-watcher  │
                                   │  descriptors          │
                                   │  hd (BIP32 derive)    │
                                   │  electrum (SPV)       │
                                   │  watcher (service)    │
                                   └──────────┬───────────┘
                                              │ subscribe to address
                                              ▼
                                        Electrum server
                                              │
 (Customer sends BTC/LTC to the address)       │ transaction notification
                                              ▼
                                   ┌──────────────────────┐
                                   │ apps/web / indexer    │
                                   │  unmatched-event flow │
                                   │  payment row create   │
                                   │  webhook dispatch     │
                                   └──────────────────────┘
```

## Package: `@paylix/utxo-watcher`

Scaffolded in this PR. The interface is stable; the implementations are
staged.

```
packages/utxo-watcher/src/
  descriptors.ts  — UTXO chain configs (Bitcoin + Litecoin mainnet/testnet)
  hd.ts           — BIP32 derivation interface (impl stub — #58)
  electrum.ts     — Electrum client interface (impl stub — #58)
  watcher.ts      — session watcher service interface (impl stub — #58)
  index.ts        — public barrel
```

Piggybacking Litecoin off the same package (issue #59) is a one-file change:
the descriptor already exists under `litecoin` / `litecoin-testnet` keys.

## Data model

Added to `checkout_sessions` in a separate migration:
```sql
ALTER TABLE checkout_sessions ADD COLUMN btc_receive_address text;
ALTER TABLE checkout_sessions ADD COLUMN btc_session_index bigint;
CREATE UNIQUE INDEX btc_session_address_idx ON checkout_sessions (btc_receive_address)
  WHERE btc_receive_address IS NOT NULL;
```

`merchant_payout_wallets` gets an `xpub` column for UTXO chains. For EVM
chains it stays NULL.

## Merchant UX

Settings → Payout Wallets → gains a `Bitcoin` / `Litecoin` row when the
respective network is enabled. Input accepts xpub / ypub / zpub (mainnet)
or tpub / Ltub / Mtub (testnet / Litecoin). Validation calls
`validateXpub(value, descriptor)` before saving.

## Platform fee

No contract means no automatic fee split. Options tracked for the
implementation PR (#58):

1. **Fee-at-payout** — merchants pay Paylix's 0.5% out of band monthly. Clean
   merchant UX, creates a billing obligation. Default.
2. **Split receive addresses** — two addresses per session, buyer sends to
   each. Most wallets don't batch multi-output sends well. Not default.

## Confirmation thresholds

Per-chain defaults in `descriptors.ts`:
- Bitcoin mainnet: 2
- Bitcoin testnet: 1
- Litecoin mainnet: 6 (faster blocks = need more for equivalent safety)
- Litecoin testnet: 2

Merchants may raise via env override (`BTC_CONFIRMATIONS=6`) per compliance.

## Non-goals

- Subscriptions on UTXO chains
- Lightning Network — tracked separately if demand appears
- Ordinals / BRC-20 — out of payment-processor scope
- MimbleWimble Extension Blocks on Litecoin — shields destroy transparency
  we rely on, ignore
