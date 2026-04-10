"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PortalLinkButton({
  customerUuid,
}: {
  customerUuid: string;
}) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${customerUuid}/portal-url`);
      if (!res.ok) return;
      const data = (await res.json()) as { url?: string };
      if (!data.url) return;
      await navigator.clipboard.writeText(data.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} disabled={loading}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Copied" : loading ? "Copying..." : "Copy link"}
    </Button>
  );
}
