"use client";

import { useCallback, useEffect, useState } from "react";
import { FormSection } from "@/components/paykit";

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
        <p className="text-sm text-foreground-muted">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="text-sm text-foreground-muted">No audit entries yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-1">
                <th className="px-3 py-2 font-medium">Time</th>
                <th className="px-3 py-2 font-medium">User</th>
                <th className="px-3 py-2 font-medium">Action</th>
                <th className="px-3 py-2 font-medium">Resource</th>
                <th className="px-3 py-2 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-border last:border-0">
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-foreground-muted">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">
                    {log.userId ? log.userId.slice(0, 8) + "..." : "-"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">{log.action}</td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">
                    {log.resourceType}
                    {log.resourceId ? ` / ${log.resourceId.slice(0, 8)}...` : ""}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-foreground-muted">
                    {log.ipAddress ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </FormSection>
  );
}
