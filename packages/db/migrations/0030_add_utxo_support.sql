-- UTXO chains (Bitcoin + Litecoin) don't have contracts, so merchants
-- settle payments directly to BIP32-derived addresses under an xpub they
-- provide. See docs/superpowers/specs/2026-04-23-bitcoin-integration.md.

ALTER TABLE checkout_sessions
  ADD COLUMN btc_receive_address text,
  ADD COLUMN btc_session_index bigint;

-- One address per session, ever. Derivation path `m/0/<session_index>` is
-- unique per merchant xpub, so this index only needs to guarantee global
-- uniqueness on the non-null values — collisions across merchants are
-- cryptographically impossible under BIP32.
CREATE UNIQUE INDEX btc_session_address_idx
  ON checkout_sessions (btc_receive_address)
  WHERE btc_receive_address IS NOT NULL;

-- xpub / tpub / Ltub / Mtub etc. NULL for EVM chains where the row carries
-- a regular wallet address in `wallet_address` instead.
ALTER TABLE merchant_payout_wallets
  ADD COLUMN xpub text;

-- Sanity: enforce that a UTXO row has exactly one of wallet_address or xpub.
-- NULL-XOR-NULL gets tricky in SQL so we keep it at the app layer for now.
-- Marker comment — if this table grows into UTXO-centric use, promote to
-- a check constraint then.
