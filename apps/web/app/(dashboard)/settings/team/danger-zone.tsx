"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormRow } from "@/components/paykit";

type Member = { memberId: string; userId: string | null; email: string | null };

export function DangerZoneActions({
  members,
  currentUserId,
  orgId,
  orgSlug,
}: {
  members: Member[];
  currentUserId: string;
  orgId: string;
  orgSlug: string;
}) {
  const router = useRouter();
  const [transferTo, setTransferTo] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const eligible = members.filter((m) => m.userId !== currentUserId);

  async function transfer() {
    if (!transferTo) return;
    setBusy(true);
    await authClient.organization.updateMemberRole({
      memberId: transferTo,
      role: "owner",
    });
    const me = members.find((m) => m.userId === currentUserId);
    if (me) {
      await authClient.organization.updateMemberRole({
        memberId: me.memberId,
        role: "member",
      });
    }
    router.refresh();
    setBusy(false);
  }

  async function deleteTeam() {
    if (deleteConfirm !== `delete ${orgSlug}`) return;
    setBusy(true);
    await authClient.organization.delete({ organizationId: orgId });
    router.push("/onboarding");
  }

  return (
    <div className="space-y-6">
      <FormRow
        label="Transfer ownership"
        htmlFor="transfer-member"
        description="Promote another member to owner. You become a regular member."
      >
        <div className="flex gap-2">
          <Select value={transferTo} onValueChange={setTransferTo}>
            <SelectTrigger id="transfer-member" className="flex-1">
              <SelectValue placeholder="Select member…" />
            </SelectTrigger>
            <SelectContent>
              {eligible.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-foreground-muted">
                  No other members
                </div>
              ) : (
                eligible.map((m) => (
                  <SelectItem key={m.memberId} value={m.memberId}>
                    {m.email ?? "—"}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button
            onClick={transfer}
            disabled={busy || !transferTo}
            variant="outline"
          >
            Transfer
          </Button>
        </div>
      </FormRow>

      <FormRow
        label="Delete team"
        htmlFor="delete-confirm"
        description={`Type "delete ${orgSlug}" to confirm. This cascades to every resource owned by the team.`}
      >
        <div className="flex gap-2">
          <Input
            id="delete-confirm"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder={`delete ${orgSlug}`}
            className="font-mono"
          />
          <Button
            variant="destructive"
            onClick={deleteTeam}
            disabled={busy || deleteConfirm !== `delete ${orgSlug}`}
          >
            Delete
          </Button>
        </div>
      </FormRow>
    </div>
  );
}
