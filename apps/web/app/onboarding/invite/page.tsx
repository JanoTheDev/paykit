"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { OnboardingStepper } from "@/components/onboarding-stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InvitePage() {
  const router = useRouter();
  const [rows, setRows] = useState<string[]>(["", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSubmitting(true);
    setError(null);
    const emails = rows.map((r) => r.trim()).filter(Boolean);
    for (const email of emails) {
      const res = await authClient.organization.inviteMember({
        email,
        role: "member",
      });
      if (res.error) {
        setError(`Failed to invite ${email}: ${res.error.message}`);
        setSubmitting(false);
        return;
      }
    }
    router.push("/overview");
  }

  return (
    <div className="space-y-8">
      <OnboardingStepper active="invite" />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-100">
          Invite your team
        </h1>
        <p className="text-sm text-slate-400">
          Invited teammates get full access to the team except removing members
          or deleting it.
        </p>
      </div>
      <div className="space-y-3">
        {rows.map((email, i) => (
          <Input
            key={i}
            type="email"
            value={email}
            onChange={(e) => {
              const next = [...rows];
              next[i] = e.target.value;
              setRows(next);
            }}
            placeholder="teammate@example.com"
          />
        ))}
        <button
          type="button"
          onClick={() => setRows([...rows, ""])}
          className="text-sm text-slate-400 hover:text-slate-200"
        >
          + Add another
        </button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={submitting}>
          {submitting ? "Sending…" : "Send invites"}
        </Button>
        <button
          type="button"
          className="text-sm text-slate-400 hover:text-slate-200"
          onClick={() => router.push("/overview")}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
