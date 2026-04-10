"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopyButtonProps {
  value: string;
}

export function CopyButton({ value }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // best effort
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy code"
      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface-2 text-foreground-dim transition-colors hover:bg-surface-3 hover:text-foreground"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-success" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
