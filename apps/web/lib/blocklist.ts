import { normalizeEmail } from "./email-normalize";

export type BlocklistType = "wallet" | "email" | "country";

export interface BlocklistEntryForMatch {
  type: BlocklistType;
  value: string;
}

export interface BlocklistCheckInput {
  wallet?: string | null;
  email?: string | null;
  country?: string | null;
  entries: BlocklistEntryForMatch[];
}

export interface BlocklistMatch {
  type: BlocklistType;
  value: string;
}

/**
 * Returns the first entry that matches the supplied identifiers, or null.
 * Walls + countries are compared case-insensitively. Emails are compared
 * post-normalization (Gmail dots stripped, +tag removed, lowercased);
 * email entries that lack an '@' are treated as domain blocks.
 *
 * Pure so the relay path and the apply-coupon path can share the same
 * matcher without the indexer ever seeing this module.
 */
export function findBlocklistMatch(
  input: BlocklistCheckInput,
): BlocklistMatch | null {
  const normalizedWallet = input.wallet?.trim().toLowerCase();
  const normalizedCountry = input.country?.trim().toUpperCase();
  const normalizedEmail = input.email
    ? normalizeEmail(input.email.trim())
    : null;
  const emailDomain = normalizedEmail
    ? normalizedEmail.slice(normalizedEmail.indexOf("@") + 1)
    : null;

  for (const entry of input.entries) {
    if (entry.type === "wallet" && normalizedWallet) {
      if (entry.value.toLowerCase() === normalizedWallet) return entry;
    } else if (entry.type === "country" && normalizedCountry) {
      if (entry.value.toUpperCase() === normalizedCountry) return entry;
    } else if (entry.type === "email" && normalizedEmail) {
      const candidate = entry.value.trim().toLowerCase();
      if (candidate.includes("@")) {
        // Full address — compare normalized to normalized.
        const normalizedCandidate = normalizeEmail(candidate);
        if (normalizedCandidate === normalizedEmail) return entry;
      } else {
        // Domain-only entry matches any address on that domain.
        if (emailDomain && candidate === emailDomain) return entry;
      }
    }
  }

  return null;
}

/**
 * User-facing message. Intentionally vague — never leak which specific
 * entry matched to avoid enumeration attacks.
 */
export const BLOCKLIST_MESSAGE = "This checkout is not available to you.";
