"use client";

import { useState, useEffect } from "react";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

export function CheckoutProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    // Load wagmi config only on the client to avoid indexedDB SSR errors
    import("@/lib/wagmi").then(({ wagmiConfig }) => {
      setConfig(wagmiConfig);
      setMounted(true);
    });
  }, []);

  if (!mounted || !config) {
    return <>{children}</>;
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#06d6a0",
            accentColorForeground: "#07070a",
            borderRadius: "medium",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
