"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface WebhookDelivery {
  id: string;
  event: string;
  status: "pending" | "delivered" | "failed";
  httpStatus: number | null;
  attempts: number;
  createdAt: string;
}

interface Webhook {
  id: string;
  url: string;
  secret: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
}

const ALL_EVENTS = [
  "payment.confirmed",
  "subscription.created",
  "subscription.charged",
  "subscription.past_due",
  "subscription.cancelled",
];

function EventBadge({ event }: { event: string }) {
  return (
    <span
      style={{
        background: "#06d6a020",
        color: "#06d6a0",
        border: "1px solid #06d6a033",
      }}
      className="inline-block rounded-full px-2.5 py-[3px] text-[11px] font-semibold leading-none tracking-[0.3px]"
    >
      {event}
    </span>
  );
}

function DeliveryStatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    delivered: { bg: "#22c55e12", text: "#22c55e", border: "#22c55e30" },
    pending: { bg: "#60a5fa12", text: "#60a5fa", border: "#60a5fa30" },
    failed: { bg: "#f8717112", text: "#f87171", border: "#f8717130" },
  };
  const s = styles[status] ?? styles.pending;

  return (
    <span
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
      className="inline-block rounded-full px-2.5 py-[3px] text-[11px] font-semibold leading-none tracking-[0.3px]"
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncateUrl(url: string, max = 50): string {
  if (url.length <= max) return url;
  return url.slice(0, max) + "...";
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-[44px] shrink-0 cursor-pointer rounded-full transition-colors duration-200"
      style={{
        backgroundColor: checked ? "#06d6a0" : "rgba(148,163,184,0.15)",
      }}
    >
      <span
        className="pointer-events-none inline-block h-[18px] w-[18px] rounded-full bg-[#f0f0f3] transition-transform duration-200"
        style={{
          transform: checked ? "translate(23px, 3px)" : "translate(3px, 3px)",
        }}
      />
    </button>
  );
}

function WebhookRow({
  webhook,
  onToggle,
  onTest,
  onDelete,
}: {
  webhook: Webhook;
  onToggle: (id: string, active: boolean) => void;
  onTest: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);
  const [testing, setTesting] = useState(false);

  const fetchDeliveries = useCallback(async () => {
    if (!expanded) return;
    setLoadingDeliveries(true);
    // Deliveries are fetched on expand - we'll use test endpoint results
    // For now we track locally after test calls
    setLoadingDeliveries(false);
  }, [expanded]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  async function handleTest() {
    setTesting(true);
    const res = await fetch(`/api/webhooks/${webhook.id}/test`, { method: "POST" });
    if (res.ok) {
      const delivery = await res.json();
      setDeliveries((prev) => [delivery, ...prev]);
      setExpanded(true);
      onTest(webhook.id);
    }
    setTesting(false);
  }

  return (
    <>
      <tr className="border-b border-[rgba(148,163,184,0.06)] transition-colors hover:bg-[#0c0c10]">
        <td className="h-[52px] px-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 text-[#94a3b8] hover:text-[#f0f0f3]"
          >
            {expanded ? (
              <ChevronDown size={16} strokeWidth={1.5} />
            ) : (
              <ChevronRight size={16} strokeWidth={1.5} />
            )}
          </button>
        </td>
        <td className="h-[52px] px-4 font-mono text-[13px] text-[#f0f0f3]">
          {truncateUrl(webhook.url)}
        </td>
        <td className="h-[52px] px-4">
          <div className="flex flex-wrap gap-1">
            {webhook.events.map((e) => (
              <EventBadge key={e} event={e} />
            ))}
          </div>
        </td>
        <td className="h-[52px] px-4">
          <Toggle
            checked={webhook.isActive}
            onChange={(v) => onToggle(webhook.id, v)}
          />
        </td>
        <td className="h-[52px] px-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleTest}
              disabled={testing}
              className="rounded-lg border border-[rgba(148,163,184,0.12)] px-3 py-1.5 text-[13px] font-medium text-[#f0f0f3] transition-colors hover:bg-[#111116] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {testing ? "Sending..." : "Send Test"}
            </button>
            <button
              onClick={() => onDelete(webhook.id)}
              className="rounded-lg border border-[#f8717130] px-3 py-1.5 text-[13px] font-medium text-[#f87171] transition-colors hover:bg-[#f8717112]"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={5} className="bg-[#0c0c10] px-4 py-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.8px] text-[#64748b]">
              Recent Deliveries
            </div>
            {loadingDeliveries ? (
              <div className="py-4 text-center text-[13px] text-[#64748b]">Loading...</div>
            ) : deliveries.length === 0 ? (
              <div className="py-4 text-center text-[13px] text-[#64748b]">
                No deliveries yet. Send a test event.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(148,163,184,0.08)]">
                    <th className="h-8 px-3 text-left text-[11px] font-medium text-[#64748b]">Event</th>
                    <th className="h-8 px-3 text-left text-[11px] font-medium text-[#64748b]">Status</th>
                    <th className="h-8 px-3 text-left text-[11px] font-medium text-[#64748b]">HTTP Code</th>
                    <th className="h-8 px-3 text-left text-[11px] font-medium text-[#64748b]">Attempts</th>
                    <th className="h-8 px-3 text-left text-[11px] font-medium text-[#64748b]">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((d) => (
                    <tr
                      key={d.id}
                      className="border-b border-[rgba(148,163,184,0.06)]"
                    >
                      <td className="h-10 px-3 font-mono text-[12px] text-[#f0f0f3]">
                        {d.event}
                      </td>
                      <td className="h-10 px-3">
                        <DeliveryStatusBadge status={d.status} />
                      </td>
                      <td className="h-10 px-3 font-mono text-[12px] text-[#94a3b8]">
                        {d.httpStatus ?? "—"}
                      </td>
                      <td className="h-10 px-3 text-[12px] tabular-nums text-[#94a3b8]">
                        {d.attempts}
                      </td>
                      <td className="h-10 px-3 text-[12px] text-[#94a3b8]">
                        {formatDate(d.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export default function WebhooksPage() {
  const [webhookList, setWebhookList] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newEvents, setNewEvents] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchWebhooks() {
    const res = await fetch("/api/webhooks");
    if (res.ok) {
      setWebhookList(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchWebhooks();
  }, []);

  async function handleCreate() {
    if (!newUrl.trim() || newEvents.length === 0) return;
    setCreating(true);
    const res = await fetch("/api/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: newUrl, events: newEvents }),
    });
    if (res.ok) {
      setShowCreate(false);
      setNewUrl("");
      setNewEvents([]);
      fetchWebhooks();
    }
    setCreating(false);
  }

  async function handleToggle(id: string, active: boolean) {
    await fetch(`/api/webhooks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: active }),
    });
    fetchWebhooks();
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    const res = await fetch(`/api/webhooks/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDeleteId(null);
      fetchWebhooks();
    }
    setDeleting(false);
  }

  function toggleEvent(event: string) {
    setNewEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-[30px] font-semibold leading-[1.15] tracking-[-0.6px] text-[#f0f0f3]">
          Webhooks
        </h1>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center rounded-lg bg-[#06d6a0] px-[18px] py-2.5 text-[14px] font-medium text-[#07070a] transition-colors hover:bg-[#05bf8e] active:bg-[#04a87b]"
        >
          Add Endpoint
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.65)] backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[rgba(148,163,184,0.12)] bg-[#18181e] p-6 shadow-[0_4px_16px_rgba(0,0,0,0.30)]">
            <h2 className="text-[20px] font-semibold leading-[1.25] tracking-[-0.4px] text-[#f0f0f3]">
              Add Webhook Endpoint
            </h2>
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium leading-none tracking-[0.1px] text-[#94a3b8]">
                  Endpoint URL
                </label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com/webhooks"
                  className="h-10 w-full rounded-lg border border-[rgba(148,163,184,0.12)] bg-[#07070a] px-3.5 font-mono text-sm text-[#f0f0f3] placeholder-[#64748b] transition-[border,box-shadow] duration-150 focus:border-[#06d6a0] focus:outline-none focus:ring-2 focus:ring-[#06d6a020]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium leading-none tracking-[0.1px] text-[#94a3b8]">
                  Events
                </label>
                <div className="space-y-2">
                  {ALL_EVENTS.map((event) => (
                    <label
                      key={event}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-[#111116]"
                    >
                      <input
                        type="checkbox"
                        checked={newEvents.includes(event)}
                        onChange={() => toggleEvent(event)}
                        className="h-4 w-4 rounded border-[rgba(148,163,184,0.12)] bg-[#07070a] text-[#06d6a0] focus:ring-[#06d6a020]"
                      />
                      <span className="font-mono text-[13px] text-[#f0f0f3]">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreate(false);
                  setNewUrl("");
                  setNewEvents([]);
                }}
                className="rounded-lg border border-[rgba(148,163,184,0.12)] px-[18px] py-2.5 text-[14px] font-medium text-[#f0f0f3] transition-colors hover:bg-[#111116]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !newUrl.trim() || newEvents.length === 0}
                className="rounded-lg bg-[#06d6a0] px-[18px] py-2.5 text-[14px] font-medium text-[#07070a] transition-colors hover:bg-[#05bf8e] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {creating ? "Creating..." : "Add Endpoint"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.65)] backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-[rgba(148,163,184,0.12)] bg-[#18181e] p-6 shadow-[0_4px_16px_rgba(0,0,0,0.30)]">
            <h2 className="text-[20px] font-semibold leading-[1.25] tracking-[-0.4px] text-[#f0f0f3]">
              Delete Webhook
            </h2>
            <p className="mt-3 text-[14px] leading-[1.55] text-[#94a3b8]">
              This will permanently delete this webhook endpoint and all its delivery history.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-lg border border-[rgba(148,163,184,0.12)] px-[18px] py-2.5 text-[14px] font-medium text-[#f0f0f3] transition-colors hover:bg-[#111116]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className="rounded-lg border border-[#f8717130] px-[18px] py-2.5 text-[14px] font-medium text-[#f87171] transition-colors hover:bg-[#f8717112] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deleting ? "Deleting..." : "Delete Webhook"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="mt-8 rounded-xl border border-[rgba(148,163,184,0.12)] bg-[#111116]">
        {loading ? (
          <div className="py-16 text-center text-[13px] text-[#64748b]">Loading...</div>
        ) : webhookList.length === 0 ? (
          <div className="py-16 text-center text-[13px] text-[#64748b]">
            No webhooks yet. Add an endpoint to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(148,163,184,0.08)]">
                  <th className="h-10 w-10 px-4 text-left text-[13px] font-medium text-[#64748b]" />
                  <th className="h-10 px-4 text-left text-[13px] font-medium text-[#64748b]">URL</th>
                  <th className="h-10 px-4 text-left text-[13px] font-medium text-[#64748b]">Events</th>
                  <th className="h-10 px-4 text-left text-[13px] font-medium text-[#64748b]">Status</th>
                  <th className="h-10 px-4 text-right text-[13px] font-medium text-[#64748b]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {webhookList.map((wh) => (
                  <WebhookRow
                    key={wh.id}
                    webhook={wh}
                    onToggle={handleToggle}
                    onTest={() => {}}
                    onDelete={(id) => setDeleteId(id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
