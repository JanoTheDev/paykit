import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { member, invitation, user, organization as orgTable } from "@paylix/db/schema";
import { getActiveOrgOrRedirect } from "@/lib/require-active-org";
import { TeamMembersTable } from "./members-table";
import { PendingInvitesTable } from "./pending-invites-table";
import { InviteForm } from "./invite-form";
import { DangerZoneActions } from "./danger-zone";

export default async function TeamSettingsPage() {
  const { organizationId: orgId, userId } = await getActiveOrgOrRedirect();

  const [members, pending, [org]] = await Promise.all([
    db
      .select({
        memberId: member.id,
        role: member.role,
        joinedAt: member.createdAt,
        userId: user.id,
        name: user.name,
        email: user.email,
      })
      .from(member)
      .leftJoin(user, eq(member.userId, user.id))
      .where(eq(member.organizationId, orgId)),
    db
      .select()
      .from(invitation)
      .where(
        and(eq(invitation.organizationId, orgId), eq(invitation.status, "pending")),
      ),
    db
      .select()
      .from(orgTable)
      .where(eq(orgTable.id, orgId)),
  ]);

  const currentUserMember = members.find((m) => m.userId === userId);
  const isOwner = currentUserMember?.role === "owner";

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Team</h1>
        <p className="text-sm text-slate-400">
          Manage members and invitations for this team.
        </p>
      </div>
      <InviteForm />
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-slate-300">Members</h2>
        <TeamMembersTable
          rows={members}
          currentUserId={userId}
          canRemove={isOwner}
        />
      </section>
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-slate-300">Pending invites</h2>
        <PendingInvitesTable rows={pending} />
      </section>
      {isOwner && org && (
        <section className="space-y-3 rounded-lg border border-red-900/40 p-4">
          <h2 className="text-sm font-medium text-red-400">Danger zone</h2>
          <p className="text-xs text-slate-500">
            Transfer ownership or delete this team. These actions are irreversible.
          </p>
          <DangerZoneActions
            members={members.map((m) => ({
              memberId: m.memberId,
              userId: m.userId,
              email: m.email,
            }))}
            currentUserId={userId}
            orgId={org.id}
            orgSlug={org.slug}
          />
        </section>
      )}
    </div>
  );
}
