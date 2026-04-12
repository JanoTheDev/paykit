export const RETRY_SCHEDULE_HOURS = [24, 72, 168] as const;
export const MAX_PAST_DUE_DAYS = 14;

export function computeNextRetryAt(failureCount: number, now: Date): Date {
  const idx = Math.min(failureCount - 1, RETRY_SCHEDULE_HOURS.length - 1);
  const hours = RETRY_SCHEDULE_HOURS[Math.max(0, idx)];
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
}

export type DunningOutcome = "retry" | "past_due" | "cancel";

export function classifyDunningOutcome(input: {
  failureCount: number;
  hoursPastDue: number;
}): DunningOutcome {
  if (input.hoursPastDue > MAX_PAST_DUE_DAYS * 24) return "cancel";
  if (input.failureCount > RETRY_SCHEDULE_HOURS.length) return "past_due";
  return "retry";
}
