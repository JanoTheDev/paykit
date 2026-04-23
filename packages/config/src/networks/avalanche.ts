import { avalanche, avalancheFuji } from "viem/chains";
import type { NetworkConfig } from "../network-types";
import {
  DAI_BRIDGED,
  MOCK_USDC,
  USDC_MAINNET,
  USDT_STANDARD,
  WBTC_STANDARD,
  WETH_BRIDGED,
  withAddress,
  withEnvVar,
} from "./_shared";

export const AVALANCHE = {
  key: "avalanche",
  chainId: 43114,
  chainName: "Avalanche C-Chain",
  environment: "mainnet",
  viemChain: avalanche,
  blockExplorer: "https://snowtrace.io",
  displayLabel: "Avalanche (Mainnet)",
  tokens: {
    USDC: withAddress(USDC_MAINNET, "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E"),
    USDT: withAddress(USDT_STANDARD, "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7"),
    DAI: withAddress(DAI_BRIDGED, "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70"),
    WETH: withAddress(WETH_BRIDGED, "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB"),
    WBTC: withAddress(WBTC_STANDARD, "0x50b7545627a5162F82A992c33b87aDc75187B218"),
  },
} as const satisfies NetworkConfig;

export const AVALANCHE_FUJI = {
  key: "avalanche-fuji",
  chainId: 43113,
  chainName: "Avalanche Fuji",
  environment: "testnet",
  viemChain: avalancheFuji,
  blockExplorer: "https://testnet.snowtrace.io",
  displayLabel: "Avalanche Fuji (Testnet)",
  tokens: {
    USDC: withEnvVar(MOCK_USDC, "NEXT_PUBLIC_FUJI_MOCK_USDC_ADDRESS"),
  },
} as const satisfies NetworkConfig;
