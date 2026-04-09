"use client";

import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  type: "publishable" | "secret";
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

function TypeBadge({ type }: { type: "publishable" | "secret" }) {
  const isPublishable = type === "publishable";
  return (
    <span
      style={{
        background: isPublishable ? "#60a5fa12" : "#fbbf2412",
        color: isPublishable ? "#60a5fa" : "#fbbf24",
        border: `1px solid ${isPublishable ? "#60a5fa30" : "#fbbf2430"}`,
      }}
      className="inline-block rounded-full px-2.5 py-[3px] text-[11px] font-semibold leading-none tracking-[0.3px]"
    >
      {isPublishable ? "Publishable" : "Secret"}
    </span>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      style={{
        background: active ? "#22c55e12" : "#f8717112",
        color: active ? "#22c55e" : "#f87171",
        border: `1px solid ${active ? "#22c55e30" : "#f8717130"}`,
      }}
      className="inline-block rounded-full px-2.5 py-[3px] text-[11px] font-semibold leading-none tracking-[0.3px]"
    >
      {active ? "Active" : "Revoked"}
    </span>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#94a3b8] transition-colors hover:bg-[#111116] hover:text-[#f0f0f3]"
    >
      {copied ? <Check size={16} strokeWidth={1.5} /> : <Copy size={16} strokeWidth={1.5} />}
    </button>
  );
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyType, setNewKeyType] = useState<"publishable" | "secret">("publishable");
  const [creating, setCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);

  async function fetchKeys() {
    const res = await fetch("/api/keys");
    if (res.ok) {
      setKeys(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchKeys();
  }, []);

  async function handleCreate() {
    if (!newKeyName.trim()) return;
    setCreating(true);
    const res = await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName, type: newKeyType }),
    });
    if (res.ok) {
      const data = await res.json();
      setCreatedKey(data.key);
      setNewKeyName("");
      setNewKeyType("publishable");
      fetchKeys();
    }
    setCreating(false);
  }

  async function handleRevoke(id: string) {
    setRevoking(true);
    const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
    if (res.ok) {
      setRevokeId(null);
      fetchKeys();
    }
    setRevoking(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-[30px] font-semibold leading-[1.15] tracking-[-0.6px] text-[#f0f0f3]">
          API Keys
        </h1>
        <button
          onClick={() => {
            setShowCreate(true);
            setCreatedKey(null);
          }}
          className="inline-flex items-center rounded-lg bg-[#06d6a0] px-[18px] py-2.5 text-[14px] font-medium text-[#07070a] transition-colors hover:bg-[#05bf8e] active:bg-[#04a87b]"
        >
          Generate Key
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.65)] backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[rgba(148,163,184,0.12)] bg-[#18181e] p-6 shadow-[0_4px_16px_rgba(0,0,0,0.30)]">
            {createdKey ? (
              <div>
                <h2 className="text-[20px] font-semibold leading-[1.25] tracking-[-0.4px] text-[#f0f0f3]">
                  Key Created
                </h2>
                <p className="mt-3 text-[14px] leading-[1.55] text-[#f87171]">
                  This key won&apos;t be shown again. Copy it now and store it securely.
                </p>
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-[rgba(148,163,184,0.12)] bg-[#07070a] px-3.5 py-2.5">
                  <code className="flex-1 break-all font-mono text-[13px] leading-[1.65] text-[#f0f0f3]">
                    {createdKey}
                  </code>
                  <CopyButton text={createdKey} />
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      setShowCreate(false);
                      setCreatedKey(null);
                    }}
                    className="rounded-lg bg-[#06d6a0] px-[18px] py-2.5 text-[14px] font-medium text-[#07070a] transition-colors hover:bg-[#05bf8e]"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-[20px] font-semibold leading-[1.25] tracking-[-0.4px] text-[#f0f0f3]">
                  Generate API Key
                </h2>
                <div className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium leading-none tracking-[0.1px] text-[#94a3b8]">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g. Production Backend"
                      className="h-10 w-full rounded-lg border border-[rgba(148,163,184,0.12)] bg-[#07070a] px-3.5 text-sm text-[#f0f0f3] placeholder-[#64748b] transition-[border,box-shadow] duration-150 focus:border-[#06d6a0] focus:outline-none focus:ring-2 focus:ring-[#06d6a020]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium leading-none tracking-[0.1px] text-[#94a3b8]">
                      Type
                    </label>
                    <select
                      value={newKeyType}
                      onChange={(e) => setNewKeyType(e.target.value as "publishable" | "secret")}
                      className="h-10 w-full rounded-lg border border-[rgba(148,163,184,0.12)] bg-[#07070a] px-3.5 text-sm text-[#f0f0f3] transition-[border,box-shadow] duration-150 focus:border-[#06d6a0] focus:outline-none focus:ring-2 focus:ring-[#06d6a020]"
                    >
                      <option value="publishable">Publishable</option>
                      <option value="secret">Secret</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setShowCreate(false)}
                    className="rounded-lg border border-[rgba(148,163,184,0.12)] px-[18px] py-2.5 text-[14px] font-medium text-[#f0f0f3] transition-colors hover:bg-[#111116]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={creating || !newKeyName.trim()}
                    className="rounded-lg bg-[#06d6a0] px-[18px] py-2.5 text-[14px] font-medium text-[#07070a] transition-colors hover:bg-[#05bf8e] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {creating ? "Generating..." : "Generate"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Revoke Confirmation */}
      {revokeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.65)] backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-[rgba(148,163,184,0.12)] bg-[#18181e] p-6 shadow-[0_4px_16px_rgba(0,0,0,0.30)]">
            <h2 className="text-[20px] font-semibold leading-[1.25] tracking-[-0.4px] text-[#f0f0f3]">
              Revoke API Key
            </h2>
            <p className="mt-3 text-[14px] leading-[1.55] text-[#94a3b8]">
              This action cannot be undone. Any integrations using this key will stop working.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setRevokeId(null)}
                className="rounded-lg border border-[rgba(148,163,184,0.12)] px-[18px] py-2.5 text-[14px] font-medium text-[#f0f0f3] transition-colors hover:bg-[#111116]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRevoke(revokeId)}
                disabled={revoking}
                className="rounded-lg border border-[#f8717130] px-[18px] py-2.5 text-[14px] font-medium text-[#f87171] transition-colors hover:bg-[#f8717112] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {revoking ? "Revoking..." : "Revoke Key"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="mt-8 rounded-xl border border-[rgba(148,163,184,0.12)] bg-[#111116]">
        {loading ? (
          <div className="py-16 text-center text-[13px] text-[#64748b]">Loading...</div>
        ) : keys.length === 0 ? (
          <div className="py-16 text-center text-[13px] text-[#64748b]">
            No API keys yet. Generate one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(148,163,184,0.08)]">
                  <th className="h-10 px-4 text-left text-[13px] font-medium text-[#64748b]">Name</th>
                  <th className="h-10 px-4 text-left text-[13px] font-medium text-[#64748b]">Prefix</th>
                  <th className="h-10 px-4 text-left text-[13px] font-medium text-[#64748b]">Type</th>
                  <th className="h-10 px-4 text-left text-[13px] font-medium text-[#64748b]">Status</th>
                  <th className="h-10 px-4 text-left text-[13px] font-medium text-[#64748b]">Last Used</th>
                  <th className="h-10 px-4 text-left text-[13px] font-medium text-[#64748b]">Created</th>
                  <th className="h-10 px-4 text-right text-[13px] font-medium text-[#64748b]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <tr
                    key={k.id}
                    className="border-b border-[rgba(148,163,184,0.06)] transition-colors hover:bg-[#0c0c10]"
                  >
                    <td className="h-[52px] px-4 text-[13px] text-[#f0f0f3]">{k.name}</td>
                    <td className="h-[52px] px-4 font-mono text-[13px] text-[#94a3b8]">
                      {k.prefix}...
                    </td>
                    <td className="h-[52px] px-4">
                      <TypeBadge type={k.type} />
                    </td>
                    <td className="h-[52px] px-4">
                      <StatusBadge active={k.isActive} />
                    </td>
                    <td className="h-[52px] px-4 text-[13px] text-[#94a3b8]">
                      {k.lastUsedAt ? formatDate(k.lastUsedAt) : "Never"}
                    </td>
                    <td className="h-[52px] px-4 text-[13px] text-[#94a3b8]">
                      {formatDate(k.createdAt)}
                    </td>
                    <td className="h-[52px] px-4 text-right">
                      {k.isActive && (
                        <button
                          onClick={() => setRevokeId(k.id)}
                          className="rounded-lg border border-[#f8717130] px-3 py-1.5 text-[13px] font-medium text-[#f87171] transition-colors hover:bg-[#f8717112]"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
