import type { Chain } from "viem";

export type Environment = "mainnet" | "testnet";

/**
 * How a buyer authorizes the gasless pull for this token:
 *
 *   - `eip2612`     — EIP-2612 `permit()` baked into the token (USDC, PYUSD)
 *   - `permit2`     — Uniswap's Permit2 singleton (USDT, WETH, WBTC, most other ERC-20s)
 *   - `dai-permit`  — DAI's non-standard legacy permit (Ethereum mainnet DAI only)
 *   - `none`        — no gasless path available; token is listed but inert
 *
 * The contract routes based on this field. `permit2` requires the PaymentVault
 * upgrade from issue #55 to be deployed on the active chain. Until that ships
 * for SubscriptionManager, `permit2` tokens can only be used for one-time
 * payments, not subscriptions — the checkout page enforces this.
 */
export type SignatureScheme = "eip2612" | "permit2" | "dai-permit" | "none";

export interface TokenConfig {
  symbol: string;
  name: string;
  decimals: number;
  /**
   * True iff the token natively implements EIP-2612 `permit()`. Kept for the
   * current EIP-2612-only code paths; new code should branch on
   * `signatureScheme` instead, which carries richer information.
   */
  supportsPermit: boolean;
  /** Authorization scheme — see SignatureScheme doc for details. */
  signatureScheme: SignatureScheme;
  /** EIP-712 domain version used by the token's permit implementation. Unused when scheme is permit2 or none. */
  eip712Version: string;
  isStable: boolean;
  /** Set only when bridged (Binance-Peg, Polygon PoS bridge, etc). UI should warn merchants. */
  bridged?: boolean;
  /** Canonical address — same across every Paylix deployment. Mutually exclusive with `addressEnvVar`. */
  address?: `0x${string}`;
  /** Env var name for per-deployment token addresses (MockUSDC on testnets). */
  addressEnvVar?: string;
}

export interface NetworkConfig<K extends string = string> {
  key: K;
  chainId: number;
  chainName: string;
  environment: Environment;
  viemChain: Chain;
  blockExplorer: string;
  displayLabel: string;
  tokens: Record<string, TokenConfig>;
}
