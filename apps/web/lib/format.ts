export function formatAmount(cents: number): string {
  const dollars = cents / 100;
  const abs = Math.abs(dollars);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${dollars < 0 ? "-" : ""}$${formatted}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function truncateAddress(value: string): string {
  if (value.length <= 12) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

export function truncateHash(value: string): string {
  if (value.length <= 12) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

const EXPLORER_BASE = "https://sepolia.basescan.org";

export function explorerUrl(
  kind: "tx" | "address",
  value: string,
): string {
  return `${EXPLORER_BASE}/${kind}/${value}`;
}
