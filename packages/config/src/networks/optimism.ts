import { optimism, optimismSepolia } from "viem/chains";
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

export const OPTIMISM = {
  key: "optimism",
  chainId: 10,
  chainName: "OP Mainnet",
  environment: "mainnet",
  viemChain: optimism,
  blockExplorer: "https://optimistic.etherscan.io",
  displayLabel: "OP Mainnet",
  tokens: {
    USDC: withAddress(USDC_MAINNET, "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85"),
    USDT: withAddress(USDT_STANDARD, "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58"),
    DAI: withAddress(DAI_STANDARD, "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1"),
    WETH: withAddress(WETH_NATIVE, "0x4200000000000000000000000000000000000006"),
    WBTC: withAddress(WBTC_STANDARD, "0x68f180fcCe6836688e9084f035309E29Bf0A2095"),
  },
} as const satisfies NetworkConfig;

export const OP_SEPOLIA = {
  key: "op-sepolia",
  chainId: 11155420,
  chainName: "OP Sepolia",
  environment: "testnet",
  viemChain: optimismSepolia,
  blockExplorer: "https://sepolia-optimism.etherscan.io",
  displayLabel: "OP Sepolia (Testnet)",
  tokens: {
    USDC: withEnvVar(MOCK_USDC, "NEXT_PUBLIC_OP_SEPOLIA_MOCK_USDC_ADDRESS"),
  },
} as const satisfies NetworkConfig;
