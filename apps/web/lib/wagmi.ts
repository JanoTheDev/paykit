// No 'use client' directive — this file is imported by server components
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { base, baseSepolia } from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { IS_MAINNET } from "./chain";

export const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  "b56e18d47c72ab683b10814fe9495694"; // public fallback for localhost testing

// Put the active network FIRST in the array so AppKit defaults to it in the
// wallet modal. A mainnet deploy shouldn't show "Base Sepolia" as the
// default option, and vice versa.
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = IS_MAINNET
  ? [base, baseSepolia]
  : [baseSepolia, base];

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
