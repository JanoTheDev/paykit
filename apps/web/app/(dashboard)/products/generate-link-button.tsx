"use client";

import { useState } from "react";
import { Link2, Copy, Check, X } from "lucide-react";

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
      title="Copy link"
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </button>
  );
}

export function GenerateLinkButton({ productId }: { productId: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to generate link");
        return;
      }

      const data = await res.json();
      setGeneratedUrl(data.url);
    } catch {
      setError("Network error");
    } finally {
      setGenerating(false);
    }
  };

  const resetModal = () => {
    setModalOpen(false);
    setGeneratedUrl(null);
    setError(null);
  };

  return (
    <>
      <button
        onClick={() => {
          setModalOpen(true);
          handleGenerate();
        }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#94a3b8] transition-colors hover:bg-[#111116] hover:text-[#f0f0f3]"
        title="Generate checkout link"
      >
        <Link2 size={16} strokeWidth={1.5} />
      </button>

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
                Checkout Link
              </h2>
              <button
                onClick={resetModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#94a3b8] transition-colors hover:bg-[#111116] hover:text-[#f0f0f3]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-6">
              {generating && (
                <p className="text-[13px] text-[#94a3b8]">Generating...</p>
              )}

              {error && (
                <p className="text-[13px] text-[#f87171]">{error}</p>
              )}

              {generatedUrl && (
                <>
                  <label className="mb-2 block text-[13px] font-medium leading-none tracking-[0.1px] text-[#94a3b8]">
                    Checkout URL
                  </label>
                  <div className="flex items-center gap-2 rounded-lg border border-[rgba(148,163,184,0.12)] bg-[#07070a] px-3.5 py-2.5">
                    <span className="flex-1 truncate font-mono text-[13px] text-[#f0f0f3]">
                      {generatedUrl}
                    </span>
                    <CopyButton text={generatedUrl} />
                  </div>
                </>
              )}

              <button
                onClick={resetModal}
                className="mt-4 w-full rounded-lg border border-[rgba(148,163,184,0.12)] bg-transparent px-[18px] py-2.5 text-[14px] font-medium text-[#f0f0f3] transition-colors hover:bg-[#111116] hover:border-[rgba(148,163,184,0.20)]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
