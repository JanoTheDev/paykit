import { describe, it, expect } from "vitest";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.enum(["one_time", "subscription"]),
  price: z.number().int().positive(),
  interval: z.enum(["monthly", "yearly"]).optional(),
  metadata: z.record(z.string()).optional(),
  checkoutFields: z.object({
    firstName: z.boolean().optional(),
    lastName: z.boolean().optional(),
    email: z.boolean().optional(),
    phone: z.boolean().optional(),
  }).optional(),
});

describe("Product API validation", () => {
  it("accepts valid one-time product", () => {
    const result = createProductSchema.safeParse({
      name: "Pro License",
      type: "one_time",
      price: 2999,
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid subscription product", () => {
    const result = createProductSchema.safeParse({
      name: "Pro Plan",
      type: "subscription",
      price: 1000,
      interval: "monthly",
      checkoutFields: { email: true, firstName: true },
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createProductSchema.safeParse({
      name: "",
      type: "one_time",
      price: 100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative price", () => {
    const result = createProductSchema.safeParse({
      name: "Test",
      type: "one_time",
      price: -100,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = createProductSchema.safeParse({
      name: "Test",
      type: "recurring",
      price: 100,
    });
    expect(result.success).toBe(false);
  });

  it("accepts metadata", () => {
    const result = createProductSchema.safeParse({
      name: "Test",
      type: "one_time",
      price: 100,
      metadata: { tier: "premium", features: "api,webhooks" },
    });
    expect(result.success).toBe(true);
  });
});
