"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog, ActionMenu } from "@/components/paykit";
import type { ActionItem } from "@/components/paykit";
import { Trash2 } from "lucide-react";

interface CancelSubscriptionButtonProps {
  subscriptionId: string;
  productName?: string | null;
}

export function CancelSubscriptionButton({
  subscriptionId,
  productName,
}: CancelSubscriptionButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const items: ActionItem[] = [
    {
      label: "Cancel subscription",
      icon: <Trash2 className="h-3.5 w-3.5" />,
      variant: "destructive",
      onSelect: () => setOpen(true),
    },
  ];

  async function handleConfirm() {
    const res = await fetch(
      `/api/subscriptions/${subscriptionId}/cancel-gasless`,
      { method: "POST" },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Cancel failed");
    }
    router.refresh();
    await new Promise((resolve) => setTimeout(resolve, 600));
  }

  return (
    <>
      <ActionMenu items={items} />
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Cancel subscription?"
        description={
          productName
            ? `Stop charging "${productName}"? The subscription will be cancelled immediately and no further charges will be attempted.`
            : "Stop charging this subscription? It will be cancelled immediately and no further charges will be attempted."
        }
        confirmLabel="Cancel subscription"
        variant="destructive"
        onConfirm={handleConfirm}
      />
    </>
  );
}
