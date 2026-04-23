import { mainnet, sepolia } from "viem/chains";
import type { NetworkConfig } from "../network-types";
import {
  DAI_ETHEREUM,
  MOCK_USDC,
  PYUSD_ETHEREUM,
  USDC_MAINNET,
  USDT_STANDARD,
  WBTC_STANDARD,
  WETH_NATIVE,
  withAddress,
  withEnvVar,
} from "./_shared";

export const ETHEREUM = {
  key: "ethereum",
  chainId: 1,
  chainName: "Ethereum",
  environment: "mainnet",
  viemChain: mainnet,
  blockExplorer: "https://etherscan.io",
  displayLabel: "Ethereum (Mainnet)",
  tokens: {
    USDC: withAddress(USDC_MAINNET, "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"),
    USDT: withAddress(USDT_STANDARD, "0xdAC17F958D2ee523a2206206994597C13D831ec7"),
    DAI: withAddress(DAI_ETHEREUM, "0x6B175474E89094C44Da98b954EedeAC495271d0F"),
    WETH: withAddress(WETH_NATIVE, "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"),
    WBTC: withAddress(WBTC_STANDARD, "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"),
    PYUSD: withAddress(PYUSD_ETHEREUM, "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8"),
  },
} as const satisfies NetworkConfig;

export const ETHEREUM_SEPOLIA = {
  key: "ethereum-sepolia",
  chainId: 11155111,
  chainName: "Ethereum Sepolia",
  environment: "testnet",
  viemChain: sepolia,
  blockExplorer: "https://sepolia.etherscan.io",
  displayLabel: "Ethereum Sepolia (Testnet)",
  tokens: {
    USDC: withEnvVar(MOCK_USDC, "NEXT_PUBLIC_ETHEREUM_SEPOLIA_MOCK_USDC_ADDRESS"),
  },
} as const satisfies NetworkConfig;
