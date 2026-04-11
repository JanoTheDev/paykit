"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MetadataEditor } from "@/components/metadata-editor";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  walletAddress: string;
  country: string;
  taxId: string;
  metadata: Record<string, string>;
}

const EMPTY: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  walletAddress: "",
  country: "",
  taxId: "",
  metadata: {},
};

export function CreateCustomerSheet({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function reset() {
    setForm(EMPTY);
    setError("");
    setSaving(false);
  }

  const hasIdentity =
    form.firstName.trim() ||
    form.lastName.trim() ||
    form.email.trim() ||
    form.walletAddress.trim();

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim() || null,
          lastName: form.lastName.trim() || null,
          email: form.email.trim() || null,
          walletAddress: form.walletAddress.trim() || null,
          country: form.country.trim() || null,
          taxId: form.taxId.trim() || null,
          metadata: form.metadata,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to create customer");
        setSaving(false);
        return;
      }
      reset();
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create customer");
      setSaving(false);
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>New customer</SheetTitle>
          <SheetDescription>
            Add a customer record manually. Use this for off-platform
            relationships or to pre-create a record you&apos;ll attach to
            future payments.
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="nc-first">First name</Label>
                <Input
                  id="nc-first"
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nc-last">Last name</Label>
                <Input
                  id="nc-last"
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nc-email">Email</Label>
              <Input
                id="nc-email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nc-wallet">Wallet address</Label>
              <Input
                id="nc-wallet"
                placeholder="0x..."
                value={form.walletAddress}
                onChange={(e) => update("walletAddress", e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="nc-country">Country</Label>
                <Input
                  id="nc-country"
                  placeholder="GB"
                  maxLength={2}
                  value={form.country}
                  onChange={(e) =>
                    update("country", e.target.value.toUpperCase())
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nc-tax">Tax / VAT ID</Label>
                <Input
                  id="nc-tax"
                  value={form.taxId}
                  onChange={(e) => update("taxId", e.target.value)}
                />
              </div>
            </div>
            <MetadataEditor
              value={form.metadata}
              onChange={(next) => update("metadata", next)}
              description="Arbitrary key-value tags attached to this customer. Visible in the dashboard and via the SDK."
            />
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
        <SheetFooter>
          <Button
            variant="outline"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={save} disabled={saving || !hasIdentity}>
            {saving ? "Saving…" : "Create customer"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
