"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Web3Providers } from "@/components/providers";
import CancelSubscriptionModal from "@/components/cancel-subscription-modal";
import { Button } from "@/components/ui/button";

interface CancelButtonProps {
  subscriptionId: string;
  onChainId: string | null;
  productName: string | null;
}

function CancelButtonInner({
  subscriptionId,
  onChainId,
  productName,
}: CancelButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleForceCancel() {
    const res = await fetch(`/api/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
    });
    if (res.ok) {
      setOpen(false);
      router.refresh();
    }
  }

  function handleConfirmed() {
    // Indexer will update the DB once the SubscriptionCancelled event
    // is processed. Refresh the page after a short delay so the merchant
    // sees the updated status.
    setTimeout(() => router.refresh(), 2500);
  }

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Cancel
      </Button>
      <CancelSubscriptionModal
        open={open}
        onClose={() => setOpen(false)}
        onChainId={onChainId}
        productName={productName}
        onForceCancel={handleForceCancel}
        onConfirmed={handleConfirmed}
      />
    </>
  );
}

export default function CancelButton(props: CancelButtonProps) {
  return (
    <Web3Providers>
      <CancelButtonInner {...props} />
    </Web3Providers>
  );
}
