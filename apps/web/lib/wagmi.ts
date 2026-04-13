// No 'use client' directive — this file is imported by server components
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { base, baseSepolia } from "@reown/appkit/networks";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { getAllNetworks } from "@paylix/config/networks";

export const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  "b56e18d47c72ab683b10814fe9495694"; // public fallback for localhost testing

/**
 * Build the AppKit network list from the registry. Includes ALL registered
 * networks (both testnet and mainnet) so the wallet can switch chains at
 * runtime based on the current checkout session's mode. Reown's AppKit uses
 * its own Chain shape that happens to match viem's for Base and Base Sepolia,
 * so we map by chainId. If you add a network to the registry that AppKit
 * doesn't support natively, this mapping needs updating.
 */
const APPKIT_CHAINS: Record<number, AppKitNetwork> = {
  [base.id]: base,
  [baseSepolia.id]: baseSepolia,
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
