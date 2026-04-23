import type { Chain } from "viem";

export type Environment = "mainnet" | "testnet";

export interface TokenConfig {
  symbol: string;
  name: string;
  decimals: number;
  /** EIP-2612 permit support. `false` → token is inert until Permit2 path lands (issue #55). */
  supportsPermit: boolean;
  /** EIP-712 domain version used by the token's permit implementation. */
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
