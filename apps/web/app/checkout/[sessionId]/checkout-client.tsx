"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain, usePublicClient } from "wagmi";
import { keccak256, stringToBytes } from "viem";
import { CheckCircle2, Clock } from "lucide-react";
import { CONTRACTS, ERC20_ABI, PAYMENT_VAULT_ABI, SUBSCRIPTION_MANAGER_ABI } from "@/lib/contracts";
import { intervalToSeconds, formatInterval } from "@/lib/billing-intervals";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MonoText } from "@/components/mono-text";
import { UsdcBadge } from "@/components/usdc-badge";
import { cn } from "@/lib/utils";

type CheckoutStatus = "active" | "viewed" | "abandoned" | "completed" | "expired";

interface CheckoutSession {
  id: string;
  status: CheckoutStatus;
  amount: number;
  currency: string;
  chain: string;
  type: string;
  merchantWallet: string;
  customerId: string | null;
  successUrl: string | null;
  cancelUrl: string | null;
  metadata: Record<string, string> | null;
  expiresAt: string | Date;
  productId: string;
  productName: string;
  productDescription: string | null;
  checkoutFields: {
    firstName?: boolean;
    lastName?: boolean;
    email?: boolean;
    phone?: boolean;
  } | null;
  billingInterval: string | null;
}

interface CheckoutClientProps {
  session: CheckoutSession;
}

function formatAmount(cents: number): string {
  return (cents / 100).toFixed(2);
}

function truncateAddress(address: string): string {
  if (address.length <= 13) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function CheckoutClient({ session }: CheckoutClientProps) {
  const { open } = useAppKit();
  const { isConnected, address } = useAppKitAccount();
  const [status, setStatus] = useState<CheckoutStatus>(session.status);
  const [copied, setCopied] = useState(false);
  const [customerFields, setCustomerFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const markedViewed = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [indexerOnline, setIndexerOnline] = useState<boolean>(true);
  const [customerUuid, setCustomerUuid] = useState<string | null>(null);
  const [portalToken, setPortalToken] = useState<string | null>(null);

  // Check indexer status on mount and every 30s
  useEffect(() => {
    let cancelled = false;
    async function checkStatus() {
      try {
        const res = await fetch("/api/system/indexer-status", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setIndexerOnline(Boolean(data.online));
      } catch {
        // ignore
      }
    }
    checkStatus();
    const id = setInterval(checkStatus, 30 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const hasCheckoutFields =
    session.checkoutFields &&
    (session.checkoutFields.firstName ||
      session.checkoutFields.lastName ||
      session.checkoutFields.email ||
      session.checkoutFields.phone);

  // Mark as viewed on mount
  useEffect(() => {
    if (markedViewed.current) return;
    markedViewed.current = true;

    fetch(`/api/checkout/${session.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "viewed" }),
    }).catch(() => {});
  }, [session.id]);

  // Poll for status changes
  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    setIsPolling(true);

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/${session.id}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "completed") {
          setStatus("completed");
          if (data.customerUuid) setCustomerUuid(data.customerUuid);
          if (data.portalToken) setPortalToken(data.portalToken);
          stopPolling();
          // Redirect after 5s (give user time to see the portal link)
          if (session.successUrl) {
            setTimeout(() => {
              window.location.href = session.successUrl!;
            }, 5000);
          }
        } else if (data.status === "expired") {
          setStatus("expired");
          stopPolling();
        }
      } catch {
        // ignore polling errors
      }
    }, 3000);
  }, [session.id, session.successUrl, stopPolling]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, []);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(session.merchantWallet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // Payment flow state
  const [payStep, setPayStep] = useState<"idle" | "approving" | "paying" | "confirming">("idle");
  const [payError, setPayError] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient({ chainId: 84532 });
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const {
    isSuccess: txConfirmed,
    isError: txFailed,
    error: txError,
  } = useWaitForTransactionReceipt({
    hash: txHash ?? undefined,
    chainId: 84532,
  });

  // Start polling when tx confirmed
  useEffect(() => {
    if (txConfirmed) {
      startPolling();
    }
  }, [txConfirmed, startPolling]);

  // Handle on-chain transaction failures (reverts, dropped, etc.)
  useEffect(() => {
    if (txFailed && txHash) {
      setPayError(txError?.message?.slice(0, 200) || "Transaction failed on-chain");
      setPayStep("idle");
      setTxHash(null);
    }
  }, [txFailed, txError, txHash]);

  // Abandonment tracking — only mark abandoned if NO payment has been initiated
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Skip if payment was initiated OR already completed/expired
      if (status !== "active" && status !== "viewed") return;
      if (txHash || payStep !== "idle") return;

      navigator.sendBeacon(
        `/api/checkout/${session.id}`,
        new Blob(
          [JSON.stringify({ status: "abandoned" })],
          { type: "application/json" }
        )
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [session.id, status, txHash, payStep]);

  const handlePay = async () => {
    if (payStep !== "idle") return; // prevent double clicks
    setPayError(null);

    // Pre-flight: guard against double-payment by checking session status
    try {
      const res = await fetch(`/api/checkout/${session.id}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.status === "completed") {
          setStatus("completed");
          if (data.customerUuid) setCustomerUuid(data.customerUuid);
          if (data.portalToken) setPortalToken(data.portalToken);
          return;
        }
        if (data.status === "expired") {
          setStatus("expired");
          return;
        }
      }
    } catch {
      // continue on network error
    }

    try {
      // Switch to Base Sepolia if not already on it
      if (chainId !== 84532) {
        setPayStep("approving");
        await switchChainAsync({ chainId: 84532 });
      }

      // Convert USDC amount (cents → 6 decimals)
      // session.amount is in cents (100 = $1.00)
      // USDC has 6 decimals, so $1.00 = 1,000,000 units
      const usdcAmount = BigInt(session.amount) * BigInt(10_000); // cents * 10^4 = 10^6 units per dollar

      // Convert IDs to bytes32
      const productIdBytes = keccak256(stringToBytes(session.productId));
      // Use the checkout session UUID as the on-chain customerId. This avoids
      // collisions between concurrent checkouts for the same merchant+amount
      // and between anonymous customers. The developer-provided customerId is
      // still stored on the session row and used for downstream customer
      // identification.
      const customerIdBytes = keccak256(stringToBytes(session.id));

      const isSubscription = session.type === "subscription";
      const spender = isSubscription
        ? CONTRACTS.subscriptionManager
        : CONTRACTS.paymentVault;

      // For subscriptions, approve a large allowance (1000x amount = 1000 charges).
      // For one-time, approve exactly the amount.
      const approvalAmount = isSubscription
        ? usdcAmount * BigInt(1000)
        : usdcAmount;

      // Step 1: Approve USDC spending
      setPayStep("approving");
      const approveHash = await writeContractAsync({
        address: CONTRACTS.usdc,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [spender, approvalAmount],
        chainId: 84532, // Base Sepolia
      });
      console.log("Approve tx:", approveHash);

      // Wait for the approval tx to be mined on-chain before calling the
      // payment contract. Avoids a race where the payment call sees stale
      // allowance and reverts.
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
      }

      // Step 2: Call createPayment or createSubscription
      setPayStep("paying");
      let payHash: `0x${string}`;

      if (isSubscription) {
        const intervalSeconds = intervalToSeconds(session.billingInterval);
        if (intervalSeconds <= 0) {
          throw new Error("Invalid billing interval for subscription");
        }

        payHash = await writeContractAsync({
          address: CONTRACTS.subscriptionManager,
          abi: SUBSCRIPTION_MANAGER_ABI,
          functionName: "createSubscription",
          args: [
            CONTRACTS.usdc,
            session.merchantWallet as `0x${string}`,
            usdcAmount,
            BigInt(intervalSeconds),
            productIdBytes,
            customerIdBytes,
          ],
          chainId: 84532, // Base Sepolia
        });
        console.log("Subscription tx:", payHash);
      } else {
        payHash = await writeContractAsync({
          address: CONTRACTS.paymentVault,
          abi: PAYMENT_VAULT_ABI,
          functionName: "createPayment",
          args: [
            CONTRACTS.usdc,
            session.merchantWallet as `0x${string}`,
            usdcAmount,
            productIdBytes,
            customerIdBytes,
          ],
          chainId: 84532, // Base Sepolia
        });
        console.log("Payment tx:", payHash);
      }

      setTxHash(payHash);
      setPayStep("confirming");
    } catch (err) {
      console.error("Payment failed:", err);
      const msg = err instanceof Error ? err.message : "Payment failed";
      setPayError(msg.slice(0, 200));
      setPayStep("idle");
    }
  };

  const displayAmount = formatAmount(session.amount);

  if (status === "completed") {
    const isSubscription = session.type === "subscription";
    return (
      <Card className="w-full max-w-[480px] p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[color:var(--success)]/30 bg-[color:var(--success)]/10">
            <CheckCircle2 size={32} className="text-[color:var(--success)]" />
          </div>
          <h2 className="mb-2 text-xl font-semibold tracking-[-0.4px]">
            {isSubscription ? "Subscription active!" : "Payment confirmed!"}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {isSubscription
              ? `You'll be charged $${displayAmount} ${formatInterval(session.billingInterval)}. First charge completed.`
              : `$${displayAmount} ${session.currency} received successfully.`}
          </p>

          {customerUuid && portalToken && (
            <Button variant="outline" className="mt-6" asChild>
              <a href={`/portal/${customerUuid}?token=${portalToken}`}>
                {isSubscription ? "Manage subscription" : "View purchase history"}
              </a>
            </Button>
          )}

          {session.successUrl && (
            <p className="mt-4 text-xs text-muted-foreground">
              Redirecting you back in a few seconds...
            </p>
          )}
        </div>

        <div className="mt-8 text-center">
          <span className="text-xs tracking-[0.2px] text-muted-foreground">
            Powered by Paylix
          </span>
        </div>
      </Card>
    );
  }

  if (status === "expired") {
    return (
      <Card className="w-full max-w-[480px] p-8 text-center shadow-2xl">
        <div className="mb-3 flex justify-center text-[color:var(--warning)]">
          <Clock size={40} />
        </div>
        <h1 className="mb-2 text-xl font-semibold tracking-[-0.4px]">
          This checkout has expired
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This payment session is no longer active. Please request a new
          checkout link.
        </p>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-[480px] p-8 shadow-2xl">
      {/* Product Info */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-[-0.4px]">
              {session.productName}
            </h1>
            {session.type === "subscription" && (
              <Badge variant="default">Subscription</Badge>
            )}
          </div>
          {session.productDescription && (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {session.productDescription}
            </p>
          )}
          {session.type === "subscription" && (
            <p className="mt-2 text-[13px] text-muted-foreground">
              You&apos;ll be charged{" "}
              <span className="font-medium text-foreground">
                ${displayAmount} {session.currency}
              </span>{" "}
              {formatInterval(session.billingInterval)} until cancelled.
            </p>
          )}
        </div>
        <div className="flex flex-shrink-0 flex-col items-end gap-1">
          <div className="flex items-baseline gap-2">
            <MonoText className="text-2xl font-semibold tracking-[-0.3px]">
              ${displayAmount}
            </MonoText>
            <UsdcBadge symbol={session.currency} />
          </div>
          {session.type === "subscription" && (
            <span className="text-[11px] text-muted-foreground">
              {formatInterval(session.billingInterval)}
            </span>
          )}
        </div>
      </div>

      {/* Indexer Offline Warning */}
      {!indexerOnline && (
        <Alert variant="default" className="mt-6 border-[color:var(--warning)]/30 bg-[color:var(--warning)]/10">
          <AlertTitle className="text-[color:var(--warning)]">
            Payment processing unavailable
          </AlertTitle>
          <AlertDescription>
            Our payment system is temporarily down. Please try again in a few
            minutes.
          </AlertDescription>
        </Alert>
      )}

      {/* Customer Fields */}
      {hasCheckoutFields && (
        <>
          <Separator className="my-6" />
          <div className="flex flex-col gap-3">
            {session.checkoutFields?.firstName && (
              <div className="space-y-1.5">
                <Label>First Name</Label>
                <Input
                  type="text"
                  value={customerFields.firstName}
                  onChange={(e) =>
                    setCustomerFields((f) => ({
                      ...f,
                      firstName: e.target.value,
                    }))
                  }
                  placeholder="John"
                />
              </div>
            )}
            {session.checkoutFields?.lastName && (
              <div className="space-y-1.5">
                <Label>Last Name</Label>
                <Input
                  type="text"
                  value={customerFields.lastName}
                  onChange={(e) =>
                    setCustomerFields((f) => ({
                      ...f,
                      lastName: e.target.value,
                    }))
                  }
                  placeholder="Doe"
                />
              </div>
            )}
            {session.checkoutFields?.email && (
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={customerFields.email}
                  onChange={(e) =>
                    setCustomerFields((f) => ({
                      ...f,
                      email: e.target.value,
                    }))
                  }
                  placeholder="john@example.com"
                />
              </div>
            )}
            {session.checkoutFields?.phone && (
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={customerFields.phone}
                  onChange={(e) =>
                    setCustomerFields((f) => ({
                      ...f,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            )}
          </div>
        </>
      )}

      <Separator className="my-6" />

      {/* Connect Wallet / Pay */}
      {!isConnected ? (
        <Button
          size="xl"
          onClick={() => open()}
          disabled={!indexerOnline}
        >
          Connect Wallet
        </Button>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-background px-3.5 py-2.5">
            <MonoText className="text-[13px] text-muted-foreground">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""}
            </MonoText>
            <button
              onClick={() => open()}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Disconnect
            </button>
          </div>
          <Button
            size="xl"
            onClick={handlePay}
            disabled={!indexerOnline || payStep !== "idle"}
          >
            {payStep === "idle" &&
              (session.type === "subscription"
                ? `Subscribe for $${displayAmount} ${formatInterval(
                    session.billingInterval,
                  )
                    .replace("per ", "/")
                    .replace("every 2 weeks", "/2 weeks")}`
                : `Pay $${displayAmount} ${session.currency}`)}
            {payStep === "approving" && "Approving USDC..."}
            {payStep === "paying" && "Confirm payment..."}
            {payStep === "confirming" && "Processing..."}
          </Button>
          {payError && (
            <Alert variant="destructive" className="mt-3">
              <AlertDescription className="text-xs">{payError}</AlertDescription>
            </Alert>
          )}
        </>
      )}

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Connect a wallet with {session.currency} on Base Sepolia to pay
        securely through our payment contract.
      </p>

      {(isPolling || status === "viewed") && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          <span className="text-sm text-muted-foreground">
            Waiting for payment...
          </span>
        </div>
      )}

      <div className="mt-8 text-center">
        <span className="text-xs tracking-[0.2px] text-muted-foreground">
          Powered by Paylix
        </span>
      </div>
    </Card>
  );
}
