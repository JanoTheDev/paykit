"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAddress } from "viem";
import { NETWORKS } from "@paylix/config/networks";
import { OnboardingStepper } from "@/components/onboarding-stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { FormSection, FormRow, FormActions } from "@/components/paykit";

interface NetworkConfigUI {
  networkKey: string;
  chainName: string;
  displayLabel: string;
  enabled: boolean;
  usesDefault: boolean;
  overrideAddress: string | null;
}

export default function WalletPage() {
  const router = useRouter();
  const [defaultAddress, setDefaultAddress] = useState("");
  const [networks, setNetworks] = useState<NetworkConfigUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.walletAddress) setDefaultAddress(data.walletAddress);
        if (Array.isArray(data.networks)) {
          setNetworks(data.networks);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function toggleNetwork(key: string) {
    setNetworks((prev) =>
      prev.map((n) =>
        n.networkKey === key ? { ...n, enabled: !n.enabled } : n,
      ),
    );
  }

  function setNetworkMode(key: string, mode: "default" | "override") {
    setNetworks((prev) =>
      prev.map((n) =>
        n.networkKey === key
          ? {
              ...n,
              usesDefault: mode === "default",
              overrideAddress:
                mode === "default" ? null : n.overrideAddress ?? "",
            }
          : n,
      ),
    );
  }

  function updateOverride(key: string, addr: string) {
    setNetworks((prev) =>
      prev.map((n) =>
        n.networkKey === key ? { ...n, overrideAddress: addr } : n,
      ),
    );
  }

  async function save() {
    setError(null);

    if (!isAddress(defaultAddress)) {
      setError("Not a valid EVM address");
      return;
    }

    for (const n of networks) {
      if (n.enabled && !n.usesDefault && n.overrideAddress) {
        if (!isAddress(n.overrideAddress)) {
          setError(
            `Invalid override address for ${n.displayLabel}`,
          );
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          walletAddress: defaultAddress,
          networks: networks.map((n) => ({
            networkKey: n.networkKey,
            enabled: n.enabled,
            overrideAddress: n.usesDefault ? null : n.overrideAddress,
          })),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? "Failed to save");
        return;
      }
      router.push("/onboarding/invite");
    } catch {
      setError("Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <OnboardingStepper active="wallet" />
        <p className="text-sm text-foreground-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <OnboardingStepper active="wallet" />

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Payout wallet</h1>
        <p className="text-sm text-foreground-muted">
          USDC payments settle to this address. You can change it later in
          Settings.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="space-y-6"
      >
        <FormSection
          title="Default payout wallet"
          description="Fallback address used for every network that doesn't have an override. Paste the 0x address of a wallet you control — MetaMask, Coinbase Wallet, or a Safe multisig."
        >
          <FormRow label="Wallet address" htmlFor="default-address">
            <Input
              id="default-address"
              type="text"
              value={defaultAddress}
              onChange={(e) => setDefaultAddress(e.target.value)}
              placeholder="0x…"
              className="font-mono"
            />
          </FormRow>
        </FormSection>

        {networks.length > 0 && (
          <FormSection
            title="Networks"
            description="Choose which chains to accept payments on, and optionally set a different payout address per network."
          >
            <div className="flex flex-col gap-3">
              {networks.map((n) => {
                const netConfig =
                  NETWORKS[n.networkKey as keyof typeof NETWORKS];
                const tokens = netConfig
                  ? Object.values(netConfig.tokens)
                  : [];

                return (
                  <div
                    key={n.networkKey}
                    className="rounded-lg border border-border bg-surface-1 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">
                          {n.displayLabel}
                        </div>
                        <div className="text-xs text-foreground-muted">
                          {n.chainName}
                        </div>
                        {tokens.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {tokens.map((t) => (
                              <Badge key={t.symbol} variant="secondary">
                                {t.symbol}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Switch
                        checked={n.enabled}
                        onCheckedChange={() => toggleNetwork(n.networkKey)}
                      />
                    </div>

                    {n.enabled && (
                      <div className="mt-3 flex flex-col gap-2">
                        <div className="flex gap-4 text-xs">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={n.usesDefault}
                              onChange={() =>
                                setNetworkMode(n.networkKey, "default")
                              }
                            />
                            Use default wallet
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={!n.usesDefault}
                              onChange={() =>
                                setNetworkMode(n.networkKey, "override")
                              }
                            />
                            Override
                          </label>
                        </div>
                        {!n.usesDefault && (
                          <Input
                            type="text"
                            placeholder="0x..."
                            value={n.overrideAddress ?? ""}
                            onChange={(e) =>
                              updateOverride(n.networkKey, e.target.value)
                            }
                            className="font-mono text-xs"
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </FormSection>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormActions>
          <button
            type="button"
            className="text-sm text-foreground-muted hover:text-foreground"
            onClick={() => router.push("/onboarding/invite")}
          >
            Skip for now
          </button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Continue"}
          </Button>
        </FormActions>
      </form>
    </div>
  );
}
