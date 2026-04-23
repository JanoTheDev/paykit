import { base, baseSepolia } from "viem/chains";
import type { NetworkConfig } from "../network-types";
import {
  DAI_STANDARD,
  MOCK_USDC,
  USDC_MAINNET,
  WETH_NATIVE,
  withAddress,
  withEnvVar,
} from "./_shared";

export const BASE = {
  key: "base",
  chainId: 8453,
  chainName: "Base",
  environment: "mainnet",
  viemChain: base,
  blockExplorer: "https://basescan.org",
  displayLabel: "Base (Mainnet)",
  tokens: {
    USDC: withAddress(USDC_MAINNET, "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"),
    // Bridged from Ethereum via the Base bridge. Not canonical MakerDAO.
    DAI: withAddress(DAI_STANDARD, "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"),
    WETH: withAddress(WETH_NATIVE, "0x4200000000000000000000000000000000000006"),
  },
} as const satisfies NetworkConfig;

export const BASE_SEPOLIA = {
  key: "base-sepolia",
  chainId: 84532,
  chainName: "Base Sepolia",
  environment: "testnet",
  viemChain: baseSepolia,
  blockExplorer: "https://sepolia.basescan.org",
  displayLabel: "Base Sepolia (Testnet)",
  tokens: {
    USDC: withEnvVar(MOCK_USDC, "NEXT_PUBLIC_MOCK_USDC_ADDRESS"),
  },
} as const satisfies NetworkConfig;
