"use client";

import { useCallback, useEffect, useState } from "react";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PageShell,
  PageHeader,
  DataTable,
  EmptyState,
  CopyableField,
  col,
} from "@/components/paykit";
import { formatAmount } from "@/lib/format";

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
  status:
    | "active"
    | "viewed"
    | "abandoned"
    | "completed"
    | "expired";
  expiresAt: string;
  createdAt: string;
}

type SessionRow = CheckoutSession & {
  createdAtDate: Date;
  expiresAtDate: Date;
};

const columns = [
  col.text<SessionRow>("productName", "Product"),
  col.status<SessionRow>("status", "Status", "checkout"),
  col.mono<SessionRow>("customerId", "Customer ID"),
  col.amount<SessionRow>("amount", "Amount", { withBadge: true }),
  col.date<SessionRow>("createdAtDate", "Created"),
  col.date<SessionRow>("expiresAtDate", "Expires"),
];

export default function CheckoutLinksPage() {
  const [sessions, setSessions] = useState<CheckoutSession[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [successUrl, setSuccessUrl] = useState("");
  const [cancelUrl, setCancelUrl] = useState("");

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

  const rows: SessionRow[] = sessions.map((s) => ({
    ...s,
    createdAtDate: new Date(s.createdAt),
    expiresAtDate: new Date(s.expiresAt),
  }));

  return (
    <PageShell>
      <PageHeader
        title="Checkout Links"
        description="Share one-time checkout URLs with customers."
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Link2 size={16} strokeWidth={1.5} />
            Generate Link
          </Button>
        }
      />

      {loading ? (
        <div className="rounded-lg border border-border bg-surface-1 py-16 text-center text-sm text-foreground-muted">
          Loading…
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          emptyState={
            <EmptyState
              title="No checkout sessions yet"
              description="Generate a checkout link to start accepting payments from a customer."
              action={
                <Button variant="outline" onClick={() => setModalOpen(true)}>
                  Generate your first checkout link
                </Button>
              }
            />
          }
        />
      )}

      <Dialog
        open={modalOpen}
        onOpenChange={(v) => (v ? setModalOpen(v) : resetModal())}
      >
        <DialogContent className="border-border bg-surface-1 sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Generate Checkout Link</DialogTitle>
            <DialogDescription>
              Share a one-time checkout URL with a customer.
            </DialogDescription>
          </DialogHeader>

          {generatedUrl ? (
            <div className="flex flex-col gap-3">
              <CopyableField label="Checkout URL" value={generatedUrl} />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Product</Label>
                <Select
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product…" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — {formatAmount(p.price)} {p.currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>
                  Customer ID{" "}
                  <span className="text-foreground-dim">(optional)</span>
                </Label>
                <Input
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="cus_…"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>
                  Success URL{" "}
                  <span className="text-foreground-dim">(optional)</span>
                </Label>
                <Input
                  type="url"
                  value={successUrl}
                  onChange={(e) => setSuccessUrl(e.target.value)}
                  placeholder="https://…"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>
                  Cancel URL{" "}
                  <span className="text-foreground-dim">(optional)</span>
                </Label>
                <Input
                  type="url"
                  value={cancelUrl}
                  onChange={(e) => setCancelUrl(e.target.value)}
                  placeholder="https://…"
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            {generatedUrl ? (
              <Button variant="outline" onClick={resetModal}>
                Done
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={resetModal}>
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={!selectedProductId || generating}
                >
                  {generating ? "Generating…" : "Generate Link"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
