import { arbitrum, arbitrumSepolia } from "viem/chains";
import type { NetworkConfig } from "../network-types";
import {
  DAI_STANDARD,
  MOCK_USDC,
  USDC_MAINNET,
  USDT_STANDARD,
  WBTC_STANDARD,
  WETH_NATIVE,
  withAddress,
  withEnvVar,
} from "./_shared";

export const ARBITRUM = {
  key: "arbitrum",
  chainId: 42161,
  chainName: "Arbitrum One",
  environment: "mainnet",
  viemChain: arbitrum,
  blockExplorer: "https://arbiscan.io",
  displayLabel: "Arbitrum One (Mainnet)",
  tokens: {
    USDC: withAddress(USDC_MAINNET, "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"),
    USDT: withAddress(USDT_STANDARD, "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"),
    DAI: withAddress(DAI_STANDARD, "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1"),
    WETH: withAddress(WETH_NATIVE, "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"),
    WBTC: withAddress(WBTC_STANDARD, "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f"),
  },
} as const satisfies NetworkConfig;

export const ARBITRUM_SEPOLIA = {
  key: "arbitrum-sepolia",
  chainId: 421614,
  chainName: "Arbitrum Sepolia",
  environment: "testnet",
  viemChain: arbitrumSepolia,
  blockExplorer: "https://sepolia.arbiscan.io",
  displayLabel: "Arbitrum Sepolia (Testnet)",
  tokens: {
    USDC: withEnvVar(MOCK_USDC, "NEXT_PUBLIC_ARBITRUM_SEPOLIA_MOCK_USDC_ADDRESS"),
  },
} as const satisfies NetworkConfig;
