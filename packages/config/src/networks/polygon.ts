import { polygon, polygonAmoy } from "viem/chains";
import type { NetworkConfig } from "../network-types";
import {
  DAI_STANDARD,
  MOCK_USDC,
  USDC_MAINNET,
  USDT_STANDARD,
  WBTC_STANDARD,
  WETH_BRIDGED,
  withAddress,
  withEnvVar,
} from "./_shared";

export const POLYGON = {
  key: "polygon",
  chainId: 137,
  chainName: "Polygon PoS",
  environment: "mainnet",
  viemChain: polygon,
  blockExplorer: "https://polygonscan.com",
  displayLabel: "Polygon (Mainnet)",
  tokens: {
    USDC: withAddress(USDC_MAINNET, "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"),
    USDT: withAddress(USDT_STANDARD, "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"),
    DAI: withAddress(DAI_STANDARD, "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063"),
    WETH: withAddress(WETH_BRIDGED, "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619"),
    WBTC: withAddress(WBTC_STANDARD, "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6"),
  },
} as const satisfies NetworkConfig;

export const POLYGON_AMOY = {
  key: "polygon-amoy",
  chainId: 80002,
  chainName: "Polygon Amoy",
  environment: "testnet",
  viemChain: polygonAmoy,
  blockExplorer: "https://amoy.polygonscan.com",
  displayLabel: "Polygon Amoy (Testnet)",
  tokens: {
    USDC: withEnvVar(MOCK_USDC, "NEXT_PUBLIC_POLYGON_AMOY_MOCK_USDC_ADDRESS"),
  },
} as const satisfies NetworkConfig;
