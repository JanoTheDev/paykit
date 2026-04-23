import { bsc, bscTestnet } from "viem/chains";
import type { NetworkConfig } from "../network-types";
import {
  DAI_BRIDGED,
  MOCK_USDC,
  USDC_BNB_BRIDGED,
  USDT_BNB_BRIDGED,
  WETH_BRIDGED,
  withAddress,
  withEnvVar,
} from "./_shared";

export const BNB = {
  key: "bnb",
  chainId: 56,
  chainName: "BNB Chain",
  environment: "mainnet",
  viemChain: bsc,
  blockExplorer: "https://bscscan.com",
  displayLabel: "BNB Chain (Mainnet)",
  tokens: {
    // Binance-Peg bridged, 18 decimals, no native EIP-2612.
    USDC: withAddress(USDC_BNB_BRIDGED, "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"),
    USDT: withAddress(USDT_BNB_BRIDGED, "0x55d398326f99059fF775485246999027B3197955"),
    DAI: withAddress(DAI_BRIDGED, "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3"),
    WETH: withAddress(WETH_BRIDGED, "0x2170Ed0880ac9A755fd29B2688956BD959F933F8"),
  },
} as const satisfies NetworkConfig;

export const BNB_TESTNET = {
  key: "bnb-testnet",
  chainId: 97,
  chainName: "BNB Chain Testnet",
  environment: "testnet",
  viemChain: bscTestnet,
  blockExplorer: "https://testnet.bscscan.com",
  displayLabel: "BNB Chain Testnet",
  tokens: {
    USDC: withEnvVar(MOCK_USDC, "NEXT_PUBLIC_BNB_TESTNET_MOCK_USDC_ADDRESS"),
  },
} as const satisfies NetworkConfig;
