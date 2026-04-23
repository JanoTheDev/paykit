import type { TokenConfig } from "../network-types";

/**
 * Shared fragments for TokenConfig entries. Each chain's file picks the
 * fragment it needs and adds the chain-specific `address` or `addressEnvVar`.
 * This keeps per-chain files small and avoids re-typing boilerplate for
 * every deployment.
 */

type FragmentKeys = Exclude<keyof TokenConfig, "address" | "addressEnvVar">;
type Fragment = Pick<TokenConfig, FragmentKeys>;

export const USDC_MAINNET: Fragment = {
  symbol: "USDC",
  name: "USD Coin",
  decimals: 6,
  supportsPermit: true,
  signatureScheme: "eip2612",
  eip712Version: "2",
  isStable: true,
};

export const MOCK_USDC: Fragment = {
  symbol: "USDC",
  name: "USD Coin (Mock)",
  decimals: 6,
  supportsPermit: true,
  signatureScheme: "eip2612",
  eip712Version: "1",
  isStable: true,
};

// Binance-Peg USDC on BNB Chain — 18 decimals, no permit, no Permit2 path
// routed yet. Listed but inert.
export const USDC_BNB_BRIDGED: Fragment = {
  symbol: "USDC",
  name: "USD Coin (Binance-Peg)",
  decimals: 18,
  supportsPermit: false,
  signatureScheme: "none",
  eip712Version: "1",
  isStable: true,
  bridged: true,
};

export const USDT_STANDARD: Fragment = {
  symbol: "USDT",
  name: "Tether USD",
  decimals: 6,
  supportsPermit: false,
  signatureScheme: "permit2",
  eip712Version: "1",
  isStable: true,
};

export const USDT_BNB_BRIDGED: Fragment = {
  symbol: "USDT",
  name: "Tether USD (Binance-Peg)",
  decimals: 18,
  supportsPermit: false,
  signatureScheme: "permit2",
  eip712Version: "1",
  isStable: true,
  bridged: true,
};

export const DAI_ETHEREUM: Fragment = {
  symbol: "DAI",
  name: "Dai Stablecoin",
  decimals: 18,
  supportsPermit: false,
  signatureScheme: "dai-permit",
  eip712Version: "1",
  isStable: true,
};

export const DAI_STANDARD: Fragment = {
  symbol: "DAI",
  name: "Dai Stablecoin",
  decimals: 18,
  supportsPermit: false,
  signatureScheme: "permit2",
  eip712Version: "1",
  isStable: true,
};

export const DAI_BRIDGED: Fragment = {
  symbol: "DAI",
  name: "Dai Stablecoin (Bridged)",
  decimals: 18,
  supportsPermit: false,
  signatureScheme: "permit2",
  eip712Version: "1",
  isStable: true,
  bridged: true,
};

export const WETH_NATIVE: Fragment = {
  symbol: "WETH",
  name: "Wrapped Ether",
  decimals: 18,
  supportsPermit: false,
  signatureScheme: "permit2",
  eip712Version: "1",
  isStable: false,
};

export const WETH_BRIDGED: Fragment = {
  symbol: "WETH",
  name: "Wrapped Ether (Bridged)",
  decimals: 18,
  supportsPermit: false,
  signatureScheme: "permit2",
  eip712Version: "1",
  isStable: false,
  bridged: true,
};

export const WBTC_STANDARD: Fragment = {
  symbol: "WBTC",
  name: "Wrapped BTC",
  decimals: 8,
  supportsPermit: false,
  signatureScheme: "permit2",
  eip712Version: "1",
  isStable: false,
};

export const PYUSD_ETHEREUM: Fragment = {
  symbol: "PYUSD",
  name: "PayPal USD",
  decimals: 6,
  supportsPermit: true,
  signatureScheme: "eip2612",
  eip712Version: "1",
  isStable: true,
};

/**
 * Attach either a canonical address or an env-var reference to a fragment,
 * producing a full TokenConfig. Keeping the split in the per-chain files
 * small and boilerplate-free.
 */
export function withAddress(fragment: Fragment, address: `0x${string}`): TokenConfig {
  return { ...fragment, address };
}

export function withEnvVar(fragment: Fragment, envVar: string): TokenConfig {
  return { ...fragment, addressEnvVar: envVar };
}
