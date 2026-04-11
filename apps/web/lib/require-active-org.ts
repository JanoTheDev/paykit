import type { auth } from "./auth";

type SessionLike = Awaited<ReturnType<typeof auth.api.getSession>>;

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export function requireActiveOrg(session: SessionLike): string {
  if (!session) {
    throw new AuthError("Unauthorized", 401);
  }
  const activeOrganizationId = (
    session.session as { activeOrganizationId?: string | null }
  ).activeOrganizationId;
  if (!activeOrganizationId) {
    throw new AuthError("No active team selected", 400);
  }
  return activeOrganizationId;
}
