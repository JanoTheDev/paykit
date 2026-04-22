import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveTax } from "@/lib/tax-rates";
import { apiError } from "@/lib/api-error";

const schema = z.object({
  country: z.string().min(2).max(2),
  state: z.string().min(2).max(3).optional(),
  subtotalCents: z.number().int().min(0),
  productRateBps: z.number().int().min(0).max(5000).optional(),
  productLabel: z.string().max(80).optional(),
  reverseCharge: z.boolean().optional(),
});

/**
 * Stateless tax preview. No auth required — this is just a view into
 * the rate table. The hosted checkout calls it on country change to
 * render "subtotal + tax = total" before signing the permit. The
 * actual tax collected at relay time still needs a second pass once
 * the permit flow is tax-aware.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "validation_failed",
      parsed.error.issues.map((i) => i.message).join("; "),
    );
  }
  const result = resolveTax(parsed.data);
  return NextResponse.json({ tax: result });
}
