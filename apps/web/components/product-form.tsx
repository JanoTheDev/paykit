"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const billingIntervals = [
  { value: "minutely", label: "Every Minute (testing)" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every 2 Weeks" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
] as const;

const schema = z
  .object({
    name: z.string().min(1, "Name is required").max(100),
    description: z.string().optional(),
    type: z.enum(["one_time", "subscription"]),
    price: z.coerce.number().int().positive("Price must be > 0"),
    billingInterval: z
      .enum([
        "minutely",
        "weekly",
        "biweekly",
        "monthly",
        "quarterly",
        "yearly",
      ])
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (d) => d.type !== "subscription" || !!d.billingInterval,
    {
      message: "Billing interval is required for subscriptions",
      path: ["billingInterval"],
    },
  );

export type ProductFormData = {
  id?: string;
  name: string;
  description: string;
  type: "one_time" | "subscription";
  price: number;
  billingInterval:
    | "minutely"
    | "weekly"
    | "biweekly"
    | "monthly"
    | "quarterly"
    | "yearly"
    | "";
  metadata: Record<string, string>;
  checkoutFields: {
    firstName: boolean;
    lastName: boolean;
    email: boolean;
    phone: boolean;
  };
};

interface ProductFormProps {
  initialData?: ProductFormData;
  mode: "create" | "edit";
}

export function ProductForm({ initialData, mode }: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      type: initialData?.type ?? "one_time",
      price: initialData?.price ?? 0,
      billingInterval: initialData?.billingInterval ?? "",
    },
  });

  const type = form.watch("type");

  useEffect(() => {
    if (type !== "subscription") {
      form.setValue("billingInterval", "");
    }
  }, [type, form]);

  const [metadataRows, setMetadataRows] = useState<
    { key: string; value: string }[]
  >(
    initialData?.metadata
      ? Object.entries(initialData.metadata).map(([key, value]) => ({
          key,
          value,
        }))
      : [],
  );

  const [checkoutFields, setCheckoutFields] = useState({
    firstName: initialData?.checkoutFields?.firstName ?? false,
    lastName: initialData?.checkoutFields?.lastName ?? false,
    email: initialData?.checkoutFields?.email ?? false,
    phone: initialData?.checkoutFields?.phone ?? false,
  });

  // On create-mode mount, pre-fill the toggles from the merchant's
  // per-account defaults (configured in /settings → Default Checkout Fields).
  // We only do this on create — editing an existing product must show its
  // own saved values, not the account defaults.
  useEffect(() => {
    if (mode !== "create" || initialData) return;
    let cancelled = false;
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.checkoutFieldDefaults) return;
        setCheckoutFields({
          firstName: Boolean(data.checkoutFieldDefaults.firstName),
          lastName: Boolean(data.checkoutFieldDefaults.lastName),
          email: Boolean(data.checkoutFieldDefaults.email),
          phone: Boolean(data.checkoutFieldDefaults.phone),
        });
      })
      .catch(() => {
        // If the fetch fails the form just keeps the all-false defaults —
        // merchant can still toggle manually.
      });
    return () => {
      cancelled = true;
    };
  }, [mode, initialData]);

  function updateMetadataRow(
    index: number,
    field: "key" | "value",
    val: string,
  ) {
    setMetadataRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  }
  function removeMetadataRow(index: number) {
    setMetadataRows((prev) => prev.filter((_, i) => i !== index));
  }
  function addMetadataRow() {
    setMetadataRows((prev) => [...prev, { key: "", value: "" }]);
  }
  function toggleCheckoutField(field: keyof typeof checkoutFields) {
    setCheckoutFields((prev) => ({ ...prev, [field]: !prev[field] }));
  }

  async function onSubmit(values: z.infer<typeof schema>) {
    setError("");
    const metadata: Record<string, string> = {};
    for (const row of metadataRows) {
      if (row.key.trim()) metadata[row.key.trim()] = row.value;
    }
    const payload: Record<string, unknown> = {
      name: values.name,
      description: values.description || undefined,
      type: values.type,
      price: values.price,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      checkoutFields,
    };
    if (values.type === "subscription" && values.billingInterval) {
      payload.billingInterval = values.billingInterval;
    }
    try {
      const url =
        mode === "edit" ? `/api/products/${initialData?.id}` : "/api/products";
      const method = mode === "edit" ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push("/products");
      router.refresh();
    } catch {
      setError("Network error");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-[640px] space-y-6"
      >
        <Card>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Product" maxLength={100} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="one_time">One-time</SelectItem>
                      <SelectItem value="subscription">Subscription</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (cents)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="1000"
                      min={1}
                      step={1}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter amount in cents. 1000 = $10.00
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {type === "subscription" && (
              <FormField
                control={form.control}
                name="billingInterval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Interval</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select interval" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {billingIntervals.map((i) => (
                          <SelectItem key={i.value} value={i.value}>
                            {i.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Metadata</h3>
              <p className="text-xs text-muted-foreground">
                Custom key-value data attached to the product.
              </p>
            </div>
            <div className="space-y-2">
              {metadataRows.map((row, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center"
                >
                  <Input
                    placeholder="key"
                    value={row.key}
                    onChange={(e) =>
                      updateMetadataRow(i, "key", e.target.value)
                    }
                    className="sm:w-[40%]"
                  />
                  <Input
                    placeholder="value"
                    value={row.value}
                    onChange={(e) =>
                      updateMetadataRow(i, "value", e.target.value)
                    }
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMetadataRow(i)}
                    className="self-end sm:self-auto"
                    aria-label="Remove field"
                  >
                    <Trash2 size={16} strokeWidth={1.5} />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addMetadataRow}
            >
              <Plus size={16} strokeWidth={1.5} />
              Add field
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Checkout Fields</h3>
              <p className="text-xs text-muted-foreground">
                Collect these from customers at checkout.
              </p>
            </div>
            <Separator />
            <div className="space-y-3">
              <ToggleRow
                label="First Name"
                checked={checkoutFields.firstName}
                onToggle={() => toggleCheckoutField("firstName")}
              />
              <ToggleRow
                label="Last Name"
                checked={checkoutFields.lastName}
                onToggle={() => toggleCheckoutField("lastName")}
              />
              <ToggleRow
                label="Email"
                checked={checkoutFields.email}
                onToggle={() => toggleCheckoutField("email")}
              />
              <ToggleRow
                label="Phone"
                checked={checkoutFields.phone}
                onToggle={() => toggleCheckoutField("phone")}
              />
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          size="xl"
          disabled={form.formState.isSubmitting}
          className="sm:w-auto sm:px-6"
        >
          {form.formState.isSubmitting
            ? "Saving..."
            : mode === "edit"
              ? "Update Product"
              : "Create Product"}
        </Button>
      </form>
    </Form>
  );
}

function ToggleRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onToggle} />
    </div>
  );
}
