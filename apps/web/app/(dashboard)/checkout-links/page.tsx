"use client";

import { useEffect, useState, useCallback } from "react";
import { Link2, Copy, Check, X } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  type: string;
  currency: string;
}

interface CheckoutSession {
  id: string;
  productId: string;
  productName: string | null;
  customerId: string | null;
  amount: number;
  currency: string;
  status: "active" | "viewed" | "abandoned" | "completed" | "expired";
  expiresAt: string;
  createdAt: string;
}

function formatAmount(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = date - now;
  const absDiff = Math.abs(diff);

  if (absDiff < 60_000) return diff > 0 ? "in <1m" : "<1m ago";
  if (absDiff < 3_600_000) {
    const mins = Math.floor(absDiff / 60_000);
    return diff > 0 ? `in ${mins}m` : `${mins}m ago`;
  }
  if (absDiff < 86_400_000) {
    const hrs = Math.floor(absDiff / 3_600_000);
    return diff > 0 ? `in ${hrs}h` : `${hrs}h ago`;
  }
  const days = Math.floor(absDiff / 86_400_000);
  return diff > 0 ? `in ${days}d` : `${days}d ago`;
}

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  active: {
    label: "Active",
    color: "#60a5fa",
    bg: "#60a5fa12",
    border: "#60a5fa30",
  },
  viewed: {
    label: "Viewed",
    color: "#fbbf24",
    bg: "#fbbf2412",
    border: "#fbbf2430",
  },
  abandoned: {
    label: "Abandoned",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.08)",
    border: "rgba(148,163,184,0.20)",
  },
  completed: {
    label: "Completed",
    color: "#22c55e",
    bg: "#22c55e12",
    border: "#22c55e30",
  },
  expired: {
    label: "Expired",
    color: "#f87171",
    bg: "#f8717112",
    border: "#f8717130",
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? statusConfig.active;
  return (
    <span
      style={{
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
      className="inline-block rounded-full px-2.5 py-[3px] text-[11px] font-semibold leading-none tracking-[0.3px]"
    >
      {cfg.label}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#94a3b8] transition-colors hover:bg-[#111116] hover:text-[#f0f0f3]"
      title="Copy checkout link"
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </button>
  );
}

export default function CheckoutLinksPage() {
  const [sessions, setSessions] = useState<CheckoutSession[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedProductId, setSelectedProductId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [successUrl, setSuccessUrl] = useState("");
  const [cancelUrl, setCancelUrl] = useState("");

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";

  const fetchData = useCallback(async () => {
    try {
      const [sessionsRes, productsRes] = await Promise.all([
        fetch("/api/checkout-links"),
        fetch("/api/products"),
      ]);
      if (sessionsRes.ok) setSessions(await sessionsRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerate = async () => {
    if (!selectedProductId) return;
    setGenerating(true);
    setError(null);
    try {
      const body: Record<string, string> = { productId: selectedProductId };
      if (customerId.trim()) body.customerId = customerId.trim();
      if (successUrl.trim()) body.successUrl = successUrl.trim();
      if (cancelUrl.trim()) body.cancelUrl = cancelUrl.trim();

      const res = await fetch("/api/checkout-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to generate link");
        return;
      }

      const data = await res.json();
      setGeneratedUrl(data.url);
      fetchData();
    } catch {
      setError("Network error");
    } finally {
      setGenerating(false);
    }
  };

  const resetModal = () => {
    setModalOpen(false);
    setGeneratedUrl(null);
    setSelectedProductId("");
    setCustomerId("");
    setSuccessUrl("");
    setCancelUrl("");
    setError(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-[30px] font-semibold leading-[1.15] tracking-[-0.6px] text-[#f0f0f3]">
          Checkout Links
        </h1>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#06d6a0] px-[18px] py-2.5 text-[14px] font-medium text-[#07070a] transition-colors hover:bg-[#05bf8e] active:bg-[#04a87b]"
        >
          <Link2 size={16} strokeWidth={1.5} />
          Generate Link
        </button>
      </div>

      <div className="mt-8 rounded-xl border border-[rgba(148,163,184,0.12)] bg-[#111116]">
        {loading ? (
          <div className="py-16 text-center">
            <p className="text-[13px] text-[#64748b]">Loading...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[13px] text-[#64748b]">
              No checkout sessions yet.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="mt-4 inline-flex items-center rounded-lg bg-transparent px-[18px] py-2.5 text-[14px] font-medium text-[#94a3b8] transition-colors hover:bg-[#111116] hover:text-[#f0f0f3]"
            >
              Generate your first checkout link
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(148,163,184,0.08)]">
                  <th className="h-10 px-4 text-left text-[13px] font-medium text-[#64748b]">
                    Product
                  </th>
                  <th className="h-10 px-4 text-left text-[13px] font-medium text-[#64748b]">
                    Status
                  </th>
                  <th className="h-10 px-4 text-left text-[13px] font-medium text-[#64748b]">
                    Customer ID
                  </th>
                  <th className="h-10 px-4 text-right text-[13px] font-medium text-[#64748b]">
                    Amount
                  </th>
                  <th className="h-10 px-4 text-left text-[13px] font-medium text-[#64748b]">
                    Created
                  </th>
                  <th className="h-10 px-4 text-left text-[13px] font-medium text-[#64748b]">
                    Expires
                  </th>
                  <th className="h-10 px-4 text-right text-[13px] font-medium text-[#64748b]">
                    Link
                  </th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-[rgba(148,163,184,0.06)] transition-colors hover:bg-[#0c0c10]"
                  >
                    <td className="h-[52px] px-4 text-[13px] text-[#f0f0f3]">
                      {s.productName ?? "—"}
                    </td>
                    <td className="h-[52px] px-4">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="h-[52px] px-4 font-mono text-[13px] text-[#94a3b8]">
                      {s.customerId ?? "—"}
                    </td>
                    <td className="h-[52px] px-4 text-right">
                      <span className="font-mono text-[13px] font-medium tabular-nums text-[#f0f0f3]">
                        {formatAmount(s.amount)}
                      </span>
                      <span
                        style={{
                          background: "#2775ca14",
                          color: "#2775ca",
                          border: "1px solid #2775ca33",
                        }}
                        className="ml-2 inline-block rounded-md px-2.5 py-[3px] font-mono text-[11px] font-semibold leading-none"
                      >
                        USDC
                      </span>
                    </td>
                    <td className="h-[52px] px-4 text-[12px] text-[#64748b]">
                      {relativeTime(s.createdAt)}
                    </td>
                    <td className="h-[52px] px-4 text-[12px] text-[#64748b]">
                      {relativeTime(s.expiresAt)}
                    </td>
                    <td className="h-[52px] px-4 text-right">
                      <CopyButton
                        text={`${baseUrl}/checkout/${s.id}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Link Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(8px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) resetModal();
          }}
        >
          <div
            className="w-full max-w-md rounded-xl border border-[rgba(148,163,184,0.12)] bg-[#18181e] p-6"
            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.30)" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-semibold leading-[1.25] tracking-[-0.4px] text-[#f0f0f3]">
                Generate Checkout Link
              </h2>
              <button
                onClick={resetModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#94a3b8] transition-colors hover:bg-[#111116] hover:text-[#f0f0f3]"
              >
                <X size={16} />
              </button>
            </div>

            {generatedUrl ? (
              <div className="mt-6">
                <label className="mb-2 block text-[13px] font-medium leading-none tracking-[0.1px] text-[#94a3b8]">
                  Checkout URL
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-[rgba(148,163,184,0.12)] bg-[#07070a] px-3.5 py-2.5">
                  <span className="flex-1 truncate font-mono text-[13px] text-[#f0f0f3]">
                    {generatedUrl}
                  </span>
                  <CopyButton text={generatedUrl} />
                </div>
                <button
                  onClick={resetModal}
                  className="mt-4 w-full rounded-lg border border-[rgba(148,163,184,0.12)] bg-transparent px-[18px] py-2.5 text-[14px] font-medium text-[#f0f0f3] transition-colors hover:bg-[#111116] hover:border-[rgba(148,163,184,0.20)]"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-[13px] font-medium leading-none tracking-[0.1px] text-[#94a3b8]">
                    Product
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="h-10 w-full rounded-lg border border-[rgba(148,163,184,0.12)] bg-[#07070a] px-3.5 text-[14px] text-[#f0f0f3] transition-colors focus:border-[#06d6a0] focus:outline-none focus:ring-[3px] focus:ring-[#06d6a020]"
                  >
                    <option value="" className="text-[#64748b]">
                      Select a product...
                    </option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatAmount(p.price)} {p.currency}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-medium leading-none tracking-[0.1px] text-[#94a3b8]">
                    Customer ID{" "}
                    <span className="text-[#64748b]">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    placeholder="cus_..."
                    className="h-10 w-full rounded-lg border border-[rgba(148,163,184,0.12)] bg-[#07070a] px-3.5 text-[14px] text-[#f0f0f3] placeholder:text-[#64748b] transition-colors focus:border-[#06d6a0] focus:outline-none focus:ring-[3px] focus:ring-[#06d6a020]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-medium leading-none tracking-[0.1px] text-[#94a3b8]">
                    Success URL{" "}
                    <span className="text-[#64748b]">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={successUrl}
                    onChange={(e) => setSuccessUrl(e.target.value)}
                    placeholder="https://..."
                    className="h-10 w-full rounded-lg border border-[rgba(148,163,184,0.12)] bg-[#07070a] px-3.5 text-[14px] text-[#f0f0f3] placeholder:text-[#64748b] transition-colors focus:border-[#06d6a0] focus:outline-none focus:ring-[3px] focus:ring-[#06d6a020]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-medium leading-none tracking-[0.1px] text-[#94a3b8]">
                    Cancel URL{" "}
                    <span className="text-[#64748b]">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={cancelUrl}
                    onChange={(e) => setCancelUrl(e.target.value)}
                    placeholder="https://..."
                    className="h-10 w-full rounded-lg border border-[rgba(148,163,184,0.12)] bg-[#07070a] px-3.5 text-[14px] text-[#f0f0f3] placeholder:text-[#64748b] transition-colors focus:border-[#06d6a0] focus:outline-none focus:ring-[3px] focus:ring-[#06d6a020]"
                  />
                </div>

                {error && (
                  <p className="text-[13px] text-[#f87171]">{error}</p>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={!selectedProductId || generating}
                  className="w-full rounded-lg bg-[#06d6a0] px-[18px] py-2.5 text-[14px] font-medium text-[#07070a] transition-colors hover:bg-[#05bf8e] active:bg-[#04a87b] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {generating ? "Generating..." : "Generate Link"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
