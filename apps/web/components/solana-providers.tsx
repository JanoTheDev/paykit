"use client";

import { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";

/**
 * Mount the Solana wallet-adapter context tree for Solana-session checkouts.
 *
 * Only rendered when the active session's network is `solana` or
 * `solana-devnet`. EVM sessions stay on the wagmi/AppKit stack and never
 * see this tree — keeps both worlds from stomping on each other's global
 * state + wallet discovery.
 */
export function SolanaProviders({
  children,
  cluster,
}: {
  children: React.ReactNode;
  cluster: "mainnet-beta" | "devnet";
}) {
  const endpoint = useMemo(() => {
    // Public endpoints have aggressive rate limits — operators should
    // pipe their own Helius / QuickNode endpoint via NEXT_PUBLIC_SOLANA_RPC
    // if they run traffic.
    if (cluster === "mainnet-beta") {
      return (
        process.env.NEXT_PUBLIC_SOLANA_RPC ??
        "https://api.mainnet-beta.solana.com"
      );
    }
    return (
      process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC ??
      "https://api.devnet.solana.com"
    );
  }, [cluster]);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
