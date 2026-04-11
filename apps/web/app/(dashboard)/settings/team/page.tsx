import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { member, invitation, user, organization as orgTable } from "@paylix/db/schema";
import { getActiveOrgOrRedirect } from "@/lib/require-active-org";
import { PageShell, PageHeader, FormSection } from "@/components/paykit";
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
    <PageShell size="sm">
      <PageHeader
        title="Team"
        description="Manage members and invitations for this team."
      />

      <FormSection
        title="Invite a teammate"
        description="Send an email invitation. They'll get a magic link to join this team."
      >
        <InviteForm />
      </FormSection>

      <FormSection
        title="Members"
        description="Everyone currently in this team."
      >
        <TeamMembersTable
          rows={members}
          currentUserId={userId}
          canRemove={isOwner}
        />
      </FormSection>

      <FormSection
        title="Pending invites"
        description="Invitations that haven't been accepted yet."
      >
        <PendingInvitesTable rows={pending} />
      </FormSection>

      {isOwner && org && (
        <FormSection
          title="Danger zone"
          description="Transfer ownership or delete this team. These actions cannot be undone."
        >
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
        </FormSection>
      )}
    </PageShell>
  );
}
