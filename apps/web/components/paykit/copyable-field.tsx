"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyableFieldProps {
  value: string;
  label?: string;
  mono?: boolean;
  className?: string;
}

export function CopyableField({
  value,
  label,
  mono = true,
  className,
}: CopyableFieldProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // best-effort; do nothing on failure
    }
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <span className="text-xs font-medium uppercase tracking-wider text-foreground-dim">
          {label}
        </span>
      )}
      <div className="flex items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2">
        <span
          className={cn(
            "flex-1 truncate text-sm text-foreground",
            mono && "font-mono tabular-nums",
          )}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy"
          className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-foreground-dim transition-colors hover:bg-surface-3 hover:text-foreground"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-success" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
