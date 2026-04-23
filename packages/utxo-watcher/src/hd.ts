/**
 * BIP32 HD-derivation from merchant-provided extended public keys.
 *
 * Paylix never holds the merchant's private keys. The merchant uploads an
 * xpub (mainnet) / tpub (testnet) / their chain's equivalent, and this module
 * derives fresh receive addresses per checkout session at a unique BIP44 path.
 * Each address is used exactly once.
 *
 * BIP44 path template:
 *   m / 44' / <coinType>' / <account>' / 0 / <sessionIndex>
 *
 * We hold the merchant-level `account` fixed at 0; the session index is a
 * monotonically-increasing integer written to the database when a checkout
 * session requests an address.
 *
 * IMPORTANT: this module does not actually implement derivation yet — it
 * documents the interface and wires through the descriptor. Full derivation
 * requires `bip32`, `bip39`, and `tiny-secp256k1` which pull native bindings
 * that need to be smoke-tested on the operator's platform. Ticket: #58.
 */

import type { UtxoChainDescriptor } from "./descriptors";

export interface DerivedAddress {
  /** Canonical base58 or bech32 address string. */
  address: string;
  /** Full BIP32 path used to derive it. */
  derivationPath: string;
  /** Session-scoped index at the terminal node. Merchant + chain + index is unique. */
  sessionIndex: number;
}

export interface Xpub {
  /** Extended public key string (xpub/tpub/Ltub/Mtub etc.). */
  key: string;
  /** Descriptor whose bip32 version bytes / network must match `key`. */
  descriptor: UtxoChainDescriptor;
}

/**
 * Derive the next receive address for a session. Implementation stub —
 * real logic lives in issue #58's implementation PR and relies on
 * bip32 + bitcoinjs-lib. The signature is stable so callers can code
 * against it today.
 */
export function deriveSessionAddress(
  _xpub: Xpub,
  _sessionIndex: number,
): DerivedAddress {
  throw new Error(
    "deriveSessionAddress is not implemented yet — tracked in issue #58. " +
      "Complete the bitcoinjs-lib + bip32 wiring before calling this function.",
  );
}

/**
 * Validate that a string is a syntactically correct extended public key and
 * that its version bytes match the expected descriptor. Implementation stub
 * — merchant-facing settings should call this on input to surface "wrong
 * network xpub" errors before saving.
 */
export function validateXpub(_value: string, _descriptor: UtxoChainDescriptor): true | string {
  throw new Error("validateXpub is not implemented yet — tracked in issue #58.");
}
