import {
  arbitrum,
  arbitrumSepolia,
  avalanche,
  avalancheFuji,
  base,
  baseSepolia,
  bsc,
  bscTestnet,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
  sepolia,
} from "viem/chains";
import type { NetworkConfig } from "./network-types";

/**
 * Canonical ERC-20 addresses for mainnet stablecoins. Verified against issuer
 * documentation (Circle, Tether, MakerDAO) — DO NOT edit without re-verifying.
 * Bridged-token comments note where the address is NOT the native-issuer
 * deployment and carries the bridge's counterparty risk.
 *
 * Tokens beyond USDC (USDT / DAI / WBTC / etc.) are tracked in issue #56 and
 * land only after the Permit2 contract upgrade in #55.
 */
const USDC = {
  symbol: "USDC" as const,
  name: "USD Coin",
  decimals: 6,
  supportsPermit: true,
  eip712Version: "2",
  isStable: true,
};

const MOCK_USDC = {
  symbol: "USDC" as const,
  name: "USD Coin (Mock)",
  decimals: 6,
  supportsPermit: true,
  eip712Version: "1",
  isStable: true,
};

export const NETWORKS = {
  // ── Mainnet ─────────────────────────────────────────────────
  ethereum: {
    key: "ethereum",
    chainId: 1,
    chainName: "Ethereum",
    environment: "mainnet",
    viemChain: mainnet,
    blockExplorer: "https://etherscan.io",
    displayLabel: "Ethereum (Mainnet)",
    tokens: {
      USDC: {
        ...USDC,
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      },
    },
  },
  base: {
    key: "base",
    chainId: 8453,
    chainName: "Base",
    environment: "mainnet",
    viemChain: base,
    blockExplorer: "https://basescan.org",
    displayLabel: "Base (Mainnet)",
    tokens: {
      USDC: {
        ...USDC,
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      },
    },
  },
  arbitrum: {
    key: "arbitrum",
    chainId: 42161,
    chainName: "Arbitrum One",
    environment: "mainnet",
    viemChain: arbitrum,
    blockExplorer: "https://arbiscan.io",
    displayLabel: "Arbitrum One (Mainnet)",
    tokens: {
      USDC: {
        ...USDC,
        address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      },
    },
  },
  optimism: {
    key: "optimism",
    chainId: 10,
    chainName: "OP Mainnet",
    environment: "mainnet",
    viemChain: optimism,
    blockExplorer: "https://optimistic.etherscan.io",
    displayLabel: "OP Mainnet",
    tokens: {
      USDC: {
        ...USDC,
        address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      },
    },
  },
  polygon: {
    key: "polygon",
    chainId: 137,
    chainName: "Polygon PoS",
    environment: "mainnet",
    viemChain: polygon,
    blockExplorer: "https://polygonscan.com",
    displayLabel: "Polygon (Mainnet)",
    tokens: {
      USDC: {
        ...USDC,
        address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
      },
    },
  },
  bnb: {
    key: "bnb",
    chainId: 56,
    chainName: "BNB Chain",
    environment: "mainnet",
    viemChain: bsc,
    blockExplorer: "https://bscscan.com",
    displayLabel: "BNB Chain (Mainnet)",
    tokens: {
      // Binance-Peg USDC has 18 decimals and does not implement EIP-2612.
      // Kept in the registry so UI can list BNB as a supported network, but
      // `supportsPermit: false` keeps it inert until Permit2 lands (issue #55).
      USDC: {
        symbol: "USDC",
        name: "USD Coin (Binance-Peg)",
        decimals: 18,
        supportsPermit: false,
        eip712Version: "1",
        isStable: true,
        bridged: true,
        address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      },
    },
  },
  avalanche: {
    key: "avalanche",
    chainId: 43114,
    chainName: "Avalanche C-Chain",
    environment: "mainnet",
    viemChain: avalanche,
    blockExplorer: "https://snowtrace.io",
    displayLabel: "Avalanche (Mainnet)",
    tokens: {
      USDC: {
        ...USDC,
        address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      },
    },
  },

  // ── Testnet ─────────────────────────────────────────────────
  // Every testnet deploys its own MockUSDC via the Foundry DeployTestnet
  // script. Addresses are captured back into .env by deploy.sh and read here
  // via addressEnvVar. Do NOT hardcode testnet addresses — they change per
  // deploy.
  "ethereum-sepolia": {
    key: "ethereum-sepolia",
    chainId: 11155111,
    chainName: "Ethereum Sepolia",
    environment: "testnet",
    viemChain: sepolia,
    blockExplorer: "https://sepolia.etherscan.io",
    displayLabel: "Ethereum Sepolia (Testnet)",
    tokens: {
      USDC: {
        ...MOCK_USDC,
        addressEnvVar: "NEXT_PUBLIC_ETHEREUM_SEPOLIA_MOCK_USDC_ADDRESS",
      },
    },
  },
  "base-sepolia": {
    key: "base-sepolia",
    chainId: 84532,
    chainName: "Base Sepolia",
    environment: "testnet",
    viemChain: baseSepolia,
    blockExplorer: "https://sepolia.basescan.org",
    displayLabel: "Base Sepolia (Testnet)",
    tokens: {
      USDC: {
        ...MOCK_USDC,
        // Kept as NEXT_PUBLIC_MOCK_USDC_ADDRESS (unprefixed) for continuity
        // with existing self-host .env files. Other testnets use the prefixed
        // scheme; migrate when convenient.
        addressEnvVar: "NEXT_PUBLIC_MOCK_USDC_ADDRESS",
      },
    },
  },
  "arbitrum-sepolia": {
    key: "arbitrum-sepolia",
    chainId: 421614,
    chainName: "Arbitrum Sepolia",
    environment: "testnet",
    viemChain: arbitrumSepolia,
    blockExplorer: "https://sepolia.arbiscan.io",
    displayLabel: "Arbitrum Sepolia (Testnet)",
    tokens: {
      USDC: {
        ...MOCK_USDC,
        addressEnvVar: "NEXT_PUBLIC_ARBITRUM_SEPOLIA_MOCK_USDC_ADDRESS",
      },
    },
  },
  "op-sepolia": {
    key: "op-sepolia",
    chainId: 11155420,
    chainName: "OP Sepolia",
    environment: "testnet",
    viemChain: optimismSepolia,
    blockExplorer: "https://sepolia-optimism.etherscan.io",
    displayLabel: "OP Sepolia (Testnet)",
    tokens: {
      USDC: {
        ...MOCK_USDC,
        addressEnvVar: "NEXT_PUBLIC_OP_SEPOLIA_MOCK_USDC_ADDRESS",
      },
    },
  },
  "polygon-amoy": {
    key: "polygon-amoy",
    chainId: 80002,
    chainName: "Polygon Amoy",
    environment: "testnet",
    viemChain: polygonAmoy,
    blockExplorer: "https://amoy.polygonscan.com",
    displayLabel: "Polygon Amoy (Testnet)",
    tokens: {
      USDC: {
        ...MOCK_USDC,
        addressEnvVar: "NEXT_PUBLIC_POLYGON_AMOY_MOCK_USDC_ADDRESS",
      },
    },
  },
  "bnb-testnet": {
    key: "bnb-testnet",
    chainId: 97,
    chainName: "BNB Chain Testnet",
    environment: "testnet",
    viemChain: bscTestnet,
    blockExplorer: "https://testnet.bscscan.com",
    displayLabel: "BNB Chain Testnet",
    tokens: {
      USDC: {
        ...MOCK_USDC,
        addressEnvVar: "NEXT_PUBLIC_BNB_TESTNET_MOCK_USDC_ADDRESS",
      },
    },
  },
  "avalanche-fuji": {
    key: "avalanche-fuji",
    chainId: 43113,
    chainName: "Avalanche Fuji",
    environment: "testnet",
    viemChain: avalancheFuji,
    blockExplorer: "https://testnet.snowtrace.io",
    displayLabel: "Avalanche Fuji (Testnet)",
    tokens: {
      USDC: {
        ...MOCK_USDC,
        addressEnvVar: "NEXT_PUBLIC_FUJI_MOCK_USDC_ADDRESS",
      },
    },
  },
} as const satisfies Record<string, NetworkConfig>;

export type NetworkKey = keyof typeof NETWORKS;
