import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "./auth";

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

export async function resolveActiveOrg(): Promise<
  | {
      ok: true;
      organizationId: string;
      userId: string;
      session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
    }
  | { ok: false; response: NextResponse }
> {
  const session = await auth.api.getSession({ headers: await headers() });
  try {
    const organizationId = requireActiveOrg(session);
    return {
      ok: true,
      organizationId,
      userId: session!.user.id,
      session: session!,
    };
  } catch (e) {
    if (e instanceof AuthError) {
      return {
        ok: false,
        response: NextResponse.json({ error: e.message }, { status: e.status }),
      };
    }
    throw e;
  }
}
