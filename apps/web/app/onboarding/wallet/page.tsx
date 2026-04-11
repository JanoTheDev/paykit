"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { isAddress } from "viem";
import { NETWORK_KEY } from "@/lib/chain";
import { OnboardingStepper } from "@/components/onboarding-stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function WalletPage() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function save() {
    if (!isAddress(address)) {
      setError("Not a valid EVM address");
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        networks: [
          {
            networkKey: NETWORK_KEY,
            enabled: true,
            overrideAddress: address,
          },
        ],
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Failed to save wallet");
      setSubmitting(false);
      return;
    }
    router.push("/onboarding/invite");
  }

  return (
    <div className="space-y-8">
      <OnboardingStepper active="wallet" />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-100">Payout wallet</h1>
        <p className="text-sm text-slate-400">
          USDC payments settle to this address. You can change it later in
          Settings → Payout.
        </p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x…"
            className="font-mono"
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Continue"}
          </Button>
          <button
            type="button"
            className="text-sm text-slate-400 hover:text-slate-200"
            onClick={() => router.push("/onboarding/invite")}
          >
            Skip for now
          </button>
        </div>
      </form>
    </div>
  );
}
