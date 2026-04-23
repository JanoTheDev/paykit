// No 'use client' directive — this file is imported by server components
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
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
} from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { getAllNetworks } from "@paylix/config/networks";

export const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  "b56e18d47c72ab683b10814fe9495694"; // public fallback for localhost testing

/**
 * Map chainId → AppKit chain object. Every chain registered in
 * packages/config/src/network-registry.ts must have a corresponding entry
 * here, otherwise the wallet won't be able to switch to it.
 */
const APPKIT_CHAINS: Record<number, AppKitNetwork> = {
  [mainnet.id]: mainnet,
  [sepolia.id]: sepolia,
  [base.id]: base,
  [baseSepolia.id]: baseSepolia,
  [arbitrum.id]: arbitrum,
  [arbitrumSepolia.id]: arbitrumSepolia,
  [optimism.id]: optimism,
  [optimismSepolia.id]: optimismSepolia,
  [polygon.id]: polygon,
  [polygonAmoy.id]: polygonAmoy,
  [bsc.id]: bsc,
  [bscTestnet.id]: bscTestnet,
  [avalanche.id]: avalanche,
  [avalancheFuji.id]: avalancheFuji,
};

const allNetworks = getAllNetworks();
const appKitNetworks = allNetworks
  .map((n) => APPKIT_CHAINS[n.chainId])
  .filter((c): c is AppKitNetwork => c !== undefined);

if (appKitNetworks.length === 0) {
  throw new Error(
    "No AppKit-supported networks registered. " +
      "Check packages/config/src/networks.ts and the APPKIT_CHAINS map above.",
  );
}

export const networks = appKitNetworks as [AppKitNetwork, ...AppKitNetwork[]];

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});

export const metadata = {
  name: "Paylix Checkout",
  description: "Accept USDC payments on Base",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  icons: [(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000") + "/favicon.ico"],
};
