export type PauseActor = "customer" | "merchant";

type PauseInput = { status: string; pausedBy: string | null };
type PauseResult =
  | { ok: true; update: { status: "paused"; pausedAt: Date; pausedBy: PauseActor } }
  | { ok: false; reason: string };

/**
 * Pauses are only allowed from `active` — not from `past_due`, `trialing`, etc.
 *
 * This is deliberate: if pause were allowed from `past_due`, the sub's existing
 * `pastDueSince` timestamp would be preserved across the pause, and a long
 * pause could cause the long-past-due sweep to cancel the sub the moment it's
 * resumed. Any future relaxation of this gate MUST also clear or freeze
 * `pastDueSince` in `computePauseUpdate`, and `computeResumeUpdate` must
 * recompute it correctly on the other side.
 *
 * With the two-party model: either "customer" or "merchant" can initiate a
 * pause, but once paused, only the same actor can resume. A pause attempt on
 * an already-paused sub is rejected regardless of actor — there's no "over-pause"
 * state.
 */
export function computePauseUpdate(
  sub: PauseInput,
  actor: PauseActor,
  now: Date,
): PauseResult {
  if (sub.status !== "active") {
    return { ok: false, reason: `cannot pause subscription in status '${sub.status}'` };
  }
  return {
    ok: true,
    update: { status: "paused", pausedAt: now, pausedBy: actor },
  };
}

type ResumeInput = {
  status: string;
  pausedAt: Date | null;
  pausedBy: string | null;
  nextChargeDate: Date | null;
};
type ResumeResult =
  | {
      ok: true;
      update: {
        status: "active";
        pausedAt: null;
        pausedBy: null;
        nextChargeDate: Date | null;
        chargeFailureCount: 0;
        lastChargeError: null;
        pastDueSince: null;
      };
    }
  | { ok: false; reason: string; code?: "paused_by_other_party" };

export function computeResumeUpdate(
  sub: ResumeInput,
  actor: PauseActor,
  now: Date,
): ResumeResult {
  if (sub.status !== "paused" || !sub.pausedAt) {
    return { ok: false, reason: `cannot resume subscription in status '${sub.status}'` };
  }
  if (sub.pausedBy && sub.pausedBy !== actor) {
    return {
      ok: false,
      reason: `subscription was paused by the ${sub.pausedBy}; only they can resume it`,
      code: "paused_by_other_party",
    };
  }
  const pausedMs = now.getTime() - sub.pausedAt.getTime();
  const nextChargeDate = sub.nextChargeDate
    ? new Date(sub.nextChargeDate.getTime() + Math.max(0, pausedMs))
    : null;
  return {
    ok: true,
    update: {
      status: "active",
      pausedAt: null,
      pausedBy: null,
      nextChargeDate,
      chargeFailureCount: 0,
      lastChargeError: null,
      pastDueSince: null,
    },
  };
}
