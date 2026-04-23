import type { NetworkConfig } from "./network-types";
import { ARBITRUM, ARBITRUM_SEPOLIA } from "./networks/arbitrum";
import { AVALANCHE, AVALANCHE_FUJI } from "./networks/avalanche";
import { BASE, BASE_SEPOLIA } from "./networks/base";
import { BNB, BNB_TESTNET } from "./networks/bnb";
import { ETHEREUM, ETHEREUM_SEPOLIA } from "./networks/ethereum";
import { OPTIMISM, OP_SEPOLIA } from "./networks/optimism";
import { POLYGON, POLYGON_AMOY } from "./networks/polygon";

/**
 * The registry. Adding a new EVM chain is: (1) create a file under
 * `networks/`, (2) add its import here. The NetworkKey union derives
 * automatically from `keyof typeof NETWORKS`.
 *
 * Per-chain files are the single source of truth for that chain's tokens,
 * keeping this file to index duty only.
 */
export const NETWORKS = {
  // ── Mainnet ─────────────────────────────────────────────────
  ethereum: ETHEREUM,
  base: BASE,
  arbitrum: ARBITRUM,
  optimism: OPTIMISM,
  polygon: POLYGON,
  bnb: BNB,
  avalanche: AVALANCHE,

  // ── Testnet ─────────────────────────────────────────────────
  "ethereum-sepolia": ETHEREUM_SEPOLIA,
  "base-sepolia": BASE_SEPOLIA,
  "arbitrum-sepolia": ARBITRUM_SEPOLIA,
  "op-sepolia": OP_SEPOLIA,
  "polygon-amoy": POLYGON_AMOY,
  "bnb-testnet": BNB_TESTNET,
  "avalanche-fuji": AVALANCHE_FUJI,
} as const satisfies Record<string, NetworkConfig>;

export type NetworkKey = keyof typeof NETWORKS;
