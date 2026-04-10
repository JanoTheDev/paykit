"use client";

import { useEffect, useState } from "react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { CheckCircle2 } from "lucide-react";
import { CONTRACTS, SUBSCRIPTION_MANAGER_ABI } from "@/lib/contracts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { MonoText } from "@/components/mono-text";

interface CancelSubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onChainId: string | null;
  productName?: string | null;
  /** Optional force-cancel (DB only). Only shown for the merchant dashboard. */
  onForceCancel?: () => Promise<void> | void;
  /** Called once the cancel tx is confirmed on-chain. */
  onConfirmed?: () => void;
  /**
   * Which side of the flow this modal is shown on. Tailors the explanatory
   * copy ("merchant wallet" vs "your wallet"). Defaults to "merchant".
   */
  context?: "merchant" | "subscriber";
  /**
   * The expected signer address (the merchant wallet, for the merchant
   * dashboard). Shown truncated in the info banner so merchants know which
   * wallet to connect.
   */
  expectedWallet?: string | null;
}

type Step =
  | "idle"
  | "switching"
  | "signing"
  | "confirming"
  | "confirmed"
  | "error";

export default function CancelSubscriptionModal({
  open,
  onClose,
  onChainId,
  productName,
  onForceCancel,
  onConfirmed,
  context = "merchant",
  expectedWallet,
}: CancelSubscriptionModalProps) {
  const { open: openAppKit } = useAppKit();
  const { isConnected, address } = useAppKitAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);
  const [forceLoading, setForceLoading] = useState(false);

  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({
    hash: txHash ?? undefined,
  });

  useEffect(() => {
    if (!open) {
      setStep("idle");
      setError(null);
      setTxHash(null);
      setForceLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (txConfirmed && step === "confirming") {
      setStep("confirmed");
      onConfirmed?.();
    }
  }, [txConfirmed, step, onConfirmed]);

  async function handleCancelOnChain() {
    if (!onChainId) {
      setError(
        "This subscription has no on-chain ID. Use force cancel instead.",
      );
      return;
    }
    setError(null);
    try {
      if (chainId !== 84532) {
        setStep("switching");
        await switchChainAsync({ chainId: 84532 });
      }
      setStep("signing");
      const hash = await writeContractAsync({
        address: CONTRACTS.subscriptionManager,
        abi: SUBSCRIPTION_MANAGER_ABI,
        functionName: "cancelSubscription",
        args: [BigInt(onChainId)],
        chainId: 84532,
      });
      setTxHash(hash);
      setStep("confirming");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Cancel failed";
      setError(msg.slice(0, 240));
      setStep("error");
    }
  }

  async function handleForceCancel() {
    if (!onForceCancel) return;
    setForceLoading(true);
    try {
      await onForceCancel();
    } finally {
      setForceLoading(false);
    }
  }

  const walletLabel =
    context === "subscriber" ? "your wallet" : "the merchant wallet";

  const truncatedExpected = expectedWallet
    ? `${expectedWallet.slice(0, 6)}...${expectedWallet.slice(-4)}`
    : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel subscription</DialogTitle>
          {productName && <DialogDescription>{productName}</DialogDescription>}
        </DialogHeader>

        {step === "confirmed" ? (
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--success)]/30 bg-[color:var(--success)]/10">
              <CheckCircle2
                size={28}
                className="text-[color:var(--success)]"
              />
            </div>
            <h3 className="mb-1 text-base font-medium">
              Subscription cancelled
            </h3>
            <p className="text-[13px] text-muted-foreground">
              The cancel transaction was confirmed on-chain. The dashboard will
              update shortly.
            </p>
            <Button className="mt-5" variant="outline" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {isConnected
                ? "Sign the cancel transaction with your connected wallet. The subscription will stop billing once the transaction is confirmed on Base Sepolia."
                : "Connect your wallet to sign the on-chain cancel transaction."}
            </p>

            <Alert className="border-[color:var(--info)]/30 bg-[color:var(--info)]/10">
              <AlertTitle className="text-[color:var(--info)]">
                Why do I need to connect a wallet?
              </AlertTitle>
              <AlertDescription className="text-xs">
                Subscriptions live on the blockchain, not just in the database.
                Cancelling requires an on-chain transaction signed by{" "}
                {walletLabel}
                {truncatedExpected && context === "merchant" ? (
                  <>
                    {" "}
                    (<MonoText>{truncatedExpected}</MonoText>)
                  </>
                ) : null}{" "}
                to permanently stop future charges. A database-only update
                wouldn&apos;t stop the on-chain keeper from pulling USDC.
              </AlertDescription>
            </Alert>

            {!onChainId && (
              <Alert className="border-[color:var(--warning)]/30 bg-[color:var(--warning)]/10">
                <AlertDescription className="text-xs text-[color:var(--warning)]">
                  This subscription has no on-chain ID. It may have been
                  created before the contract integration. You can only
                  force-cancel it in the database.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            {!isConnected ? (
              <Button size="xl" onClick={() => openAppKit()}>
                Connect Wallet
              </Button>
            ) : (
              <>
                <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3.5 py-2.5">
                  <MonoText className="text-[13px] text-muted-foreground">
                    {address
                      ? `${address.slice(0, 6)}...${address.slice(-4)}`
                      : ""}
                  </MonoText>
                  <button
                    onClick={() => openAppKit()}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Switch
                  </button>
                </div>
                <Button
                  variant="destructive"
                  size="xl"
                  onClick={handleCancelOnChain}
                  disabled={
                    !onChainId ||
                    step === "switching" ||
                    step === "signing" ||
                    step === "confirming"
                  }
                >
                  {step === "idle" && "Confirm Cancel"}
                  {step === "switching" && "Switching to Base Sepolia..."}
                  {step === "signing" && "Waiting for signature..."}
                  {step === "confirming" && "Confirming on Base..."}
                  {step === "error" && "Try again"}
                </Button>
              </>
            )}

            {onForceCancel && (
              <>
                <Separator />
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-xs text-muted-foreground">
                    Don&apos;t have the merchant wallet handy? You can mark the
                    subscription as cancelled in the database only. The
                    on-chain subscription will remain active until cancelled.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={handleForceCancel}
                    disabled={forceLoading}
                  >
                    {forceLoading ? "Cancelling..." : "Force cancel (DB only)"}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
