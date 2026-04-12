"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ActionMenu } from "@/components/paykit";
import type { ActionItem } from "@/components/paykit";
import { PauseCircle, PlayCircle } from "lucide-react";

interface PauseResumeSubscriptionButtonProps {
  subscriptionId: string;
  status: "active" | "paused";
}

export function PauseResumeSubscriptionButton({
  subscriptionId,
  status,
}: PauseResumeSubscriptionButtonProps) {
  const router = useRouter();

  async function handlePause() {
    const res = await fetch(`/api/subscriptions/${subscriptionId}/pause`, {
      method: "POST",
    });
    if (res.ok) {
      toast.success("Subscription paused");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data?.error?.message ?? "Failed to pause");
    }
  }

  async function handleResume() {
    const res = await fetch(`/api/subscriptions/${subscriptionId}/resume`, {
      method: "POST",
    });
    if (res.ok) {
      toast.success("Subscription resumed");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data?.error?.message ?? "Failed to resume");
    }
  }

  const items: ActionItem[] =
    status === "active"
      ? [
          {
            label: "Pause subscription",
            icon: <PauseCircle className="h-3.5 w-3.5" />,
            onSelect: handlePause,
          },
        ]
      : [
          {
            label: "Resume subscription",
            icon: <PlayCircle className="h-3.5 w-3.5" />,
            onSelect: handleResume,
          },
        ];

  return <ActionMenu items={items} />;
}
