"use client";

import { useCallback, useEffect, useState } from "react";
import { FormSection } from "@/components/paykit";
import { Shield, Key, Package, Bell, Users, CreditCard, Settings, RefreshCw } from "lucide-react";

interface AuditLogEntry {
  id: string;
  userId: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  details: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: string;
}

const ACTION_META: Record<
  string,
  { label: string; icon: typeof Shield; color: string }
> = {
  "api_key.created": { label: "API key created", icon: Key, color: "text-emerald-400" },
  "api_key.revoked": { label: "API key revoked", icon: Key, color: "text-rose-400" },
  "product.created": { label: "Product created", icon: Package, color: "text-emerald-400" },
  "product.updated": { label: "Product updated", icon: Package, color: "text-sky-400" },
  "webhook.created": { label: "Webhook created", icon: Bell, color: "text-emerald-400" },
  "webhook.updated": { label: "Webhook updated", icon: Bell, color: "text-sky-400" },
  "webhook.deleted": { label: "Webhook deleted", icon: Bell, color: "text-rose-400" },
  "subscription.cancelled": { label: "Subscription cancelled", icon: CreditCard, color: "text-rose-400" },
  "subscription.trial_cancelled": { label: "Trial cancelled", icon: CreditCard, color: "text-amber-400" },
  "subscription.trial_retried": { label: "Trial retried", icon: RefreshCw, color: "text-sky-400" },
  "customer.deleted": { label: "Customer deleted", icon: Users, color: "text-rose-400" },
  "settings.updated": { label: "Settings updated", icon: Settings, color: "text-sky-400" },
  "subscription.created": { label: "Subscription started", icon: CreditCard, color: "text-emerald-400" },
  "subscription.trial_converted": { label: "Trial converted", icon: CreditCard, color: "text-emerald-400" },
  "subscription.renewed": { label: "Subscription renewed", icon: CreditCard, color: "text-sky-400" },
  "subscription.cancelled_onchain": { label: "Subscription cancelled (on-chain)", icon: CreditCard, color: "text-rose-400" },
  "payment.confirmed": { label: "Payment confirmed", icon: CreditCard, color: "text-emerald-400" },
};

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function AuditLogSection() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/audit-log");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs ?? []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <FormSection
      title="Audit Log"
      description="Recent sensitive operations performed by your team."
    >
      {loading ? (
        <div className="flex items-center gap-2 py-8">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground-muted border-t-transparent" />
          <p className="text-sm text-foreground-muted">Loading audit log...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <Shield size={32} className="mb-3 text-foreground-muted" />
          <p className="text-sm text-foreground-muted">No audit entries yet.</p>
          <p className="mt-1 text-xs text-foreground-muted">
            Actions like creating API keys, updating products, and cancelling subscriptions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {logs.map((log) => {
            const meta = ACTION_META[log.action] ?? {
              label: log.action,
              icon: Shield,
              color: "text-foreground-muted",
            };
            const Icon = meta.icon;
            const detailName =
              (log.details?.name as string) ??
              (log.details?.url as string) ??
              null;

            return (
              <div
                key={log.id}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-surface-1"
              >
                <div className={`flex-shrink-0 ${meta.color}`}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {meta.label}
                    </span>
                    {detailName && (
                      <span className="truncate text-xs text-foreground-muted">
                        {detailName}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-foreground-muted">
                    {log.resourceId && (
                      <span className="font-mono">
                        {log.resourceType}/{log.resourceId.slice(0, 8)}
                      </span>
                    )}
                    {log.ipAddress && (
                      <span className="font-mono">{log.ipAddress}</span>
                    )}
                  </div>
                </div>
                <span className="flex-shrink-0 text-xs text-foreground-muted">
                  {formatRelativeTime(log.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </FormSection>
  );
}
