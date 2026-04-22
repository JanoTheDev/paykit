import type { PaylixConfig } from "./types";

export type BlocklistType = "wallet" | "email" | "country";

export interface BlocklistEntry {
  id: string;
  type: BlocklistType;
  value: string;
  reason: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface AddBlocklistEntryParams {
  type: BlocklistType;
  value: string;
  reason?: string;
}

export async function listBlocklist(
  config: PaylixConfig,
): Promise<BlocklistEntry[]> {
  const response = await fetch(`${config.backendUrl}/api/blocklist`, {
    headers: { Authorization: `Bearer ${config.apiKey}` },
  });
  if (!response.ok) {
    throw new Error(`Paylix blocklist list failed: ${response.statusText}`);
  }
  return (await response.json()) as BlocklistEntry[];
}

export async function addBlocklistEntry(
  config: PaylixConfig,
  params: AddBlocklistEntryParams,
): Promise<BlocklistEntry> {
  const response = await fetch(`${config.backendUrl}/api/blocklist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const error = (await response
      .json()
      .catch(() => ({ error: "Request failed" }))) as { error?: { message?: string } | string };
    const msg =
      typeof error.error === "string"
        ? error.error
        : error.error?.message ?? response.statusText;
    throw new Error(`Paylix blocklist add failed: ${msg}`);
  }
  return (await response.json()) as BlocklistEntry;
}

export async function removeBlocklistEntry(
  config: PaylixConfig,
  id: string,
): Promise<void> {
  const response = await fetch(`${config.backendUrl}/api/blocklist/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${config.apiKey}` },
  });
  if (!response.ok) {
    throw new Error(`Paylix blocklist remove failed: ${response.statusText}`);
  }
}
