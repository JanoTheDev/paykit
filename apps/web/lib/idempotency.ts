import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { idempotencyKeys } from "@paylix/db/schema";
import { and, eq, gt } from "drizzle-orm";
import { apiError } from "./api-error";

const TTL_MS = 24 * 60 * 60 * 1000;

export function hashRequestBody(body: string): string {
  return createHash("sha256").update(body).digest("hex");
}

type ExistingRow = {
  requestHash: string;
  responseStatus: number;
  responseBody: unknown;
} | null;

export type IdempotencyResult =
  | { kind: "miss" }
  | { kind: "hit"; responseStatus: number; responseBody: unknown }
  | { kind: "conflict" };

export function evaluateIdempotency(input: {
  existing: ExistingRow;
  requestHash: string;
}): IdempotencyResult {
  if (!input.existing) return { kind: "miss" };
  if (input.existing.requestHash !== input.requestHash) return { kind: "conflict" };
  return {
    kind: "hit",
    responseStatus: input.existing.responseStatus,
    responseBody: input.existing.responseBody,
  };
}

/**
 * Wraps an API handler with idempotency. Pass the request, the org id, and a
 * function that produces the response. If the request has no Idempotency-Key
 * header, the handler runs unchanged. Body must be JSON.
 *
 * Known limitation: two concurrent requests with the same key that both miss
 * the cache will both run the handler. The second insert is absorbed by
 * onConflictDoNothing(), but both callers receive their own handler result —
 * so non-deterministic handlers (e.g. a checkout that mints an ID) can still
 * produce duplicates under parallel load. Fixing this requires a two-phase
 * insert (sentinel row + later update) or an advisory lock and is deferred.
 */
export async function withIdempotency(
  request: Request,
  organizationId: string,
  handler: (rawBody: string) => Promise<Response>,
): Promise<Response> {
  const key = request.headers.get("idempotency-key");
  const rawBody = await request.text();

  if (!key) {
    return handler(rawBody);
  }

  if (key.length > 255) {
    return apiError(
      "invalid_idempotency_key",
      "Idempotency-Key must be 255 characters or fewer.",
      400,
    );
  }

  const requestHash = hashRequestBody(rawBody);

  const [existing] = await db
    .select({
      requestHash: idempotencyKeys.requestHash,
      responseStatus: idempotencyKeys.responseStatus,
      responseBody: idempotencyKeys.responseBody,
    })
    .from(idempotencyKeys)
    .where(
      and(
        eq(idempotencyKeys.organizationId, organizationId),
        eq(idempotencyKeys.key, key),
        gt(idempotencyKeys.expiresAt, new Date()),
      ),
    );

  const evaluation = evaluateIdempotency({ existing: existing ?? null, requestHash });

  if (evaluation.kind === "hit") {
    return NextResponse.json(evaluation.responseBody, { status: evaluation.responseStatus });
  }
  if (evaluation.kind === "conflict") {
    return apiError(
      "idempotency_key_reused",
      "Idempotency-Key was reused with a different request body.",
      409,
    );
  }

  const response = await handler(rawBody);
  let body: unknown;
  try {
    body = await response.clone().json();
  } catch {
    // Non-JSON response — pass through without caching. Idempotency only
    // covers JSON routes in Paylix; caching binary/empty responses would
    // require a nullable response_body column.
    return response;
  }

  await db
    .insert(idempotencyKeys)
    .values({
      organizationId,
      key,
      requestHash,
      responseStatus: response.status,
      responseBody: body,
      expiresAt: new Date(Date.now() + TTL_MS),
    })
    .onConflictDoNothing();

  return response;
}
