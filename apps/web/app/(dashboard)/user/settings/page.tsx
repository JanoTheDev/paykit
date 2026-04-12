"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  PageShell,
  PageHeader,
  FormSection,
  FormRow,
  FormActions,
} from "@/components/paykit";
import { signOut } from "@/lib/auth-client";

export default function UserSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) return;
      const data = await res.json();
      setName(data.name ?? "");
      setEmail(data.email ?? "");
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveName() {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error?.message ?? "Failed to save");
        return;
      }
      setSuccess("Name updated.");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <PageShell>
        <PageHeader title="Account Settings" description="Manage your personal account." />
        <p className="text-sm text-foreground-muted">Loading...</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Account Settings"
        description="Manage your personal account."
      />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mb-6 border-success/30 bg-success/5">
          <AlertDescription className="text-success">{success}</AlertDescription>
        </Alert>
      )}

      <FormSection title="Profile" description="Your display name and email address.">
        <FormRow label="Name">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={100}
          />
        </FormRow>
        <FormRow label="Email">
          <Input value={email} disabled className="opacity-60" />
          <p className="mt-1 text-xs text-foreground-muted">
            Email cannot be changed here. Contact support to update it.
          </p>
        </FormRow>
        <FormActions>
          <Button onClick={saveName} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </FormActions>
      </FormSection>

      <FormSection title="Account" description="Sign out or permanently delete your account.">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleSignOut}>
            Sign out
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              if (
                !confirm(
                  "Are you sure? This will permanently delete your account, all your data, and remove you from all teams. This cannot be undone.",
                )
              )
                return;
              if (
                !confirm(
                  "This is your last chance. Type anything to cancel, or press OK to delete your account forever.",
                )
              )
                return;
              try {
                const res = await fetch("/api/user/delete", { method: "POST" });
                if (res.ok) {
                  router.push("/login");
                } else {
                  const body = await res.json().catch(() => ({}));
                  setError(body.error?.message ?? "Failed to delete account");
                }
              } catch {
                setError("Network error");
              }
            }}
          >
            Delete account
          </Button>
        </div>
      </FormSection>
    </PageShell>
  );
}
