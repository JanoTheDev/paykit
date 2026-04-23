import type { NetworkConfig, PaylixNetwork } from "./types";

/**
 * Merchant-facing network metadata used by the SDK's client helpers
 * (explorer links, display names). Contract addresses here are defaults for
 * self-hosters of the hosted dashboard; production code never reads these
 * fields for money-moving operations — the backend always has the canonical
 * addresses under `${CHAIN}_PAYMENT_VAULT` / `_SUBSCRIPTION_MANAGER` env.
 *
 * The SDK stays monorepo-dep-free per the package invariant, so this table
 * intentionally duplicates a subset of `@paylix/config` and MUST be kept
 * in sync when a chain is added.
 */
export const NETWORKS: Record<PaylixNetwork, NetworkConfig> = {
  // ── EVM mainnet ──────────────────────────────────────────────────
  ethereum: {
    chainId: 1,
    rpcUrl: "https://eth.llamarpc.com",
    paymentVaultAddress: "0x0000000000000000000000000000000000000000",
    subscriptionManagerAddress: "0x0000000000000000000000000000000000000000",
    usdcAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    basescanUrl: "https://etherscan.io",
  },
  base: {
    chainId: 8453,
    rpcUrl: "https://mainnet.base.org",
    paymentVaultAddress: "0x0000000000000000000000000000000000000000",
    subscriptionManagerAddress: "0x0000000000000000000000000000000000000000",
    usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    basescanUrl: "https://basescan.org",
  },
  arbitrum: {
    chainId: 42161,
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    paymentVaultAddress: "0x0000000000000000000000000000000000000000",
    subscriptionManagerAddress: "0x0000000000000000000000000000000000000000",
    usdcAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    basescanUrl: "https://arbiscan.io",
  },
  optimism: {
    chainId: 10,
    rpcUrl: "https://mainnet.optimism.io",
    paymentVaultAddress: "0x0000000000000000000000000000000000000000",
    subscriptionManagerAddress: "0x0000000000000000000000000000000000000000",
    usdcAddress: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    basescanUrl: "https://optimistic.etherscan.io",
  },
  polygon: {
    chainId: 137,
    rpcUrl: "https://polygon-rpc.com",
    paymentVaultAddress: "0x0000000000000000000000000000000000000000",
    subscriptionManagerAddress: "0x0000000000000000000000000000000000000000",
    usdcAddress: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    basescanUrl: "https://polygonscan.com",
  },
  bnb: {
    chainId: 56,
    rpcUrl: "https://bsc-dataseed.bnbchain.org",
    paymentVaultAddress: "0x0000000000000000000000000000000000000000",
    subscriptionManagerAddress: "0x0000000000000000000000000000000000000000",
    usdcAddress: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    basescanUrl: "https://bscscan.com",
  },
  avalanche: {
    chainId: 43114,
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    paymentVaultAddress: "0x0000000000000000000000000000000000000000",
    subscriptionManagerAddress: "0x0000000000000000000000000000000000000000",
    usdcAddress: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    basescanUrl: "https://snowtrace.io",
  },

  // ── EVM testnet ──────────────────────────────────────────────────
  "ethereum-sepolia": {
    chainId: 11155111,
    rpcUrl: "https://rpc.sepolia.org",
    paymentVaultAddress: "0x0000000000000000000000000000000000000000",
    subscriptionManagerAddress: "0x0000000000000000000000000000000000000000",
    usdcAddress: "0x0000000000000000000000000000000000000000",
    basescanUrl: "https://sepolia.etherscan.io",
  },
  "base-sepolia": {
    chainId: 84532,
    rpcUrl: "https://sepolia.base.org",
    paymentVaultAddress: "0x0000000000000000000000000000000000000000",
    subscriptionManagerAddress: "0x0000000000000000000000000000000000000000",
    usdcAddress: "0x0000000000000000000000000000000000000000",
    basescanUrl: "https://sepolia.basescan.org",
  },
  "arbitrum-sepolia": {
    chainId: 421614,
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    paymentVaultAddress: "0x0000000000000000000000000000000000000000",
    subscriptionManagerAddress: "0x0000000000000000000000000000000000000000",
    usdcAddress: "0x0000000000000000000000000000000000000000",
    basescanUrl: "https://sepolia.arbiscan.io",
  },
  "op-sepolia": {
    chainId: 11155420,
    rpcUrl: "https://sepolia.optimism.io",
    paymentVaultAddress: "0x0000000000000000000000000000000000000000",
    subscriptionManagerAddress: "0x0000000000000000000000000000000000000000",
    usdcAddress: "0x0000000000000000000000000000000000000000",
    basescanUrl: "https://sepolia-optimism.etherscan.io",
  },
  "polygon-amoy": {
    chainId: 80002,
    rpcUrl: "https://rpc-amoy.polygon.technology",
    paymentVaultAddress: "0x0000000000000000000000000000000000000000",
    subscriptionManagerAddress: "0x0000000000000000000000000000000000000000",
    usdcAddress: "0x0000000000000000000000000000000000000000",
    basescanUrl: "https://amoy.polygonscan.com",
  },
  "bnb-testnet": {
    chainId: 97,
    rpcUrl: "https://bsc-testnet.publicnode.com",
    paymentVaultAddress: "0x0000000000000000000000000000000000000000",
    subscriptionManagerAddress: "0x0000000000000000000000000000000000000000",
    usdcAddress: "0x0000000000000000000000000000000000000000",
    basescanUrl: "https://testnet.bscscan.com",
  },
  "avalanche-fuji": {
    chainId: 43113,
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    paymentVaultAddress: "0x0000000000000000000000000000000000000000",
    subscriptionManagerAddress: "0x0000000000000000000000000000000000000000",
    usdcAddress: "0x0000000000000000000000000000000000000000",
    basescanUrl: "https://testnet.snowtrace.io",
  },

  // ── Non-EVM ──────────────────────────────────────────────────────
  // Shape reuses NetworkConfig but EVM-specific fields are ignored by the
  // SDK at runtime when the network is non-EVM. Real values come from the
  // Solana / UTXO packages.
  solana: {
    chainId: 0,
    rpcUrl: "https://api.mainnet-beta.solana.com",
    paymentVaultAddress: "0x0000000000000000000000000000000000000000",
    subscriptionManagerAddress: "0x0000000000000000000000000000000000000000",
    usdcAddress: "0x0000000000000000000000000000000000000000",
    basescanUrl: "https://solscan.io",
  },
  "solana-devnet": {
    chainId: 0,
    rpcUrl: "https://api.devnet.solana.com",
    paymentVaultAddress: "0x0000000000000000000000000000000000000000",
    subscriptionManagerAddress: "0x0000000000000000000000000000000000000000",
    usdcAddress: "0x0000000000000000000000000000000000000000",
    basescanUrl: "https://solscan.io/?cluster=devnet",
  },
  bitcoin: {
    chainId: 0,
    rpcUrl: "",
    paymentVaultAddress: "0x0000000000000000000000000000000000000000",
    subscriptionManagerAddress: "0x0000000000000000000000000000000000000000",
    usdcAddress: "0x0000000000000000000000000000000000000000",
    basescanUrl: "https://mempool.space",
  },
  "bitcoin-testnet": {
    chainId: 0,
    rpcUrl: "",
    paymentVaultAddress: "0x0000000000000000000000000000000000000000",
    subscriptionManagerAddress: "0x0000000000000000000000000000000000000000",
    usdcAddress: "0x0000000000000000000000000000000000000000",
    basescanUrl: "https://mempool.space/testnet",
  },
  litecoin: {
    chainId: 0,
    rpcUrl: "",
    paymentVaultAddress: "0x0000000000000000000000000000000000000000",
    subscriptionManagerAddress: "0x0000000000000000000000000000000000000000",
    usdcAddress: "0x0000000000000000000000000000000000000000",
    basescanUrl: "https://live.blockcypher.com/ltc",
  },
  "litecoin-testnet": {
    chainId: 0,
    rpcUrl: "",
    paymentVaultAddress: "0x0000000000000000000000000000000000000000",
    subscriptionManagerAddress: "0x0000000000000000000000000000000000000000",
    usdcAddress: "0x0000000000000000000000000000000000000000",
    basescanUrl: "https://chain.so/testnet/LTC",
  },
};
