"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CancelButton({
  subscriptionId,
}: {
  subscriptionId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this subscription?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/subscriptions/${subscriptionId}/cancel`, {
        method: "POST",
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="inline-flex items-center rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: "transparent",
        borderColor: "#f8717130",
        color: "#f87171",
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.background = "#f8717112";
          e.currentTarget.style.borderColor = "#f8717150";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.borderColor = "#f8717130";
      }}
    >
      {loading ? "Cancelling..." : "Cancel"}
    </button>
  );
}
