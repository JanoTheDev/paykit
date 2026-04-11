"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  PageShell,
  PageHeader,
  FormSection,
  FormRow,
  FormActions,
} from "@/components/paykit";

interface UserSettings {
  id: string;
  name: string;
  email: string;
  walletAddress: string | null;
}

interface CheckoutDefaults {
  firstName: boolean;
  lastName: boolean;
  email: boolean;
  phone: boolean;
}

const CHECKOUT_FIELDS: { key: keyof CheckoutDefaults; label: string }[] = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
];

export default function SettingsPage() {
  const [user, setUser] = useState<UserSettings | null>(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [name, setName] = useState("");
  const [checkoutDefaults, setCheckoutDefaults] = useState<CheckoutDefaults>({
    firstName: true,
    lastName: true,
    email: true,
    phone: false,
  });

  const [walletSaving, setWalletSaving] = useState(false);
  const [walletSuccess, setWalletSuccess] = useState(false);
  const [walletError, setWalletError] = useState("");

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [defaultsSaving, setDefaultsSaving] = useState(false);
  const [defaultsSuccess, setDefaultsSuccess] = useState(false);

  const network = process.env.NEXT_PUBLIC_NETWORK || "base-sepolia";
  const isMainnet = network === "base";

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data: UserSettings & {
          checkoutFieldDefaults?: CheckoutDefaults;
        } = await res.json();
        setUser(data);
        setWalletAddress(data.walletAddress || "");
        setName(data.name);
        if (data.checkoutFieldDefaults) {
          setCheckoutDefaults(data.checkoutFieldDefaults);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveWallet() {
    setWalletSaving(true);
    setWalletError("");
    setWalletSuccess(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });
      if (!res.ok) {
        const data = await res.json();
        setWalletError(data.error || "Failed to save");
      } else {
        setWalletSuccess(true);
        setTimeout(() => setWalletSuccess(false), 2000);
      }
    } catch {
      setWalletError("Failed to save");
    } finally {
      setWalletSaving(false);
    }
  }

  async function saveProfile() {
    setProfileSaving(true);
    setProfileError("");
    setProfileSuccess(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json();
        setProfileError(data.error || "Failed to save");
      } else {
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 2000);
      }
    } catch {
      setProfileError("Failed to save");
    } finally {
      setProfileSaving(false);
    }
  }

  async function saveCheckoutDefaults() {
    setDefaultsSaving(true);
    setDefaultsSuccess(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutFieldDefaults: checkoutDefaults }),
      });
      if (res.ok) {
        setDefaultsSuccess(true);
        setTimeout(() => setDefaultsSuccess(false), 2000);
      }
    } catch {
      // ignore
    } finally {
      setDefaultsSaving(false);
    }
  }

  if (!user) {
    return (
      <PageShell size="sm">
        <PageHeader title="Settings" />
        <p className="text-sm text-foreground-muted">Loading…</p>
      </PageShell>
    );
  }

  return (
    <PageShell size="sm">
      <PageHeader title="Settings" />

      <FormSection
        title="Wallet"
        description="USDC payments will be sent to this address on Base."
      >
        <FormRow label="Payout Wallet Address" htmlFor="wallet-address">
          <Input
            id="wallet-address"
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="0x…"
            className="font-mono"
          />
        </FormRow>
        {walletError && (
          <Alert variant="destructive">
            <AlertDescription>{walletError}</AlertDescription>
          </Alert>
        )}
        <FormActions>
          {walletSuccess && (
            <span className="text-sm font-medium text-success">Saved</span>
          )}
          <Button onClick={saveWallet} disabled={walletSaving}>
            {walletSaving ? "Saving…" : "Save"}
          </Button>
        </FormActions>
      </FormSection>

      <FormSection
        title="Network"
        description="Configured via the NEXT_PUBLIC_NETWORK environment variable."
      >
        <div className="flex items-center gap-3">
          <Badge variant={isMainnet ? "success" : "info"}>
            {isMainnet ? "Mainnet" : "Testnet"}
          </Badge>
          <span className="text-sm">
            {isMainnet ? "Base (Mainnet)" : "Base Sepolia (Testnet)"}
          </span>
        </div>
      </FormSection>

      <FormSection title="Profile">
        <FormRow label="Name" htmlFor="profile-name">
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </FormRow>
        <FormRow label="Email">
          <div className="text-sm text-foreground-muted">{user.email}</div>
        </FormRow>
        {profileError && (
          <Alert variant="destructive">
            <AlertDescription>{profileError}</AlertDescription>
          </Alert>
        )}
        <FormActions>
          {profileSuccess && (
            <span className="text-sm font-medium text-success">Saved</span>
          )}
          <Button onClick={saveProfile} disabled={profileSaving}>
            {profileSaving ? "Saving…" : "Save"}
          </Button>
        </FormActions>
      </FormSection>

      <FormSection
        title="Default Checkout Fields"
        description="These fields will be enabled by default on new products."
      >
        <div className="flex flex-col gap-3">
          {CHECKOUT_FIELDS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm">{label}</span>
              <Switch
                checked={checkoutDefaults[key]}
                onCheckedChange={(val) =>
                  setCheckoutDefaults((prev) => ({ ...prev, [key]: val }))
                }
              />
            </div>
          ))}
        </div>
        <FormActions>
          {defaultsSuccess && (
            <span className="text-sm font-medium text-success">Saved</span>
          )}
          <Button onClick={saveCheckoutDefaults} disabled={defaultsSaving}>
            {defaultsSaving ? "Saving…" : "Save"}
          </Button>
        </FormActions>
      </FormSection>
    </PageShell>
  );
}
