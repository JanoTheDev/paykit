import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { idempotencyKeys } from "@paylix/db/schema";
import { and, eq, gt } from "drizzle-orm";
import { apiError } from "./api-error";

const TTL_MS = 24 * 60 * 60 * 1000;
const POLL_INTERVAL_MS = 100;
const MAX_POLL_DURATION_MS = 10_000;
export const STALE_SENTINEL_MS = 30_000;

export function hashRequestBody(body: string): string {
  return createHash("sha256").update(body).digest("hex");
}

type SentinelRow = {
  requestHash: string;
  responseStatus: number | null;
  responseBody: unknown;
  completedAt: Date | null;
  createdAt: Date;
};

export type SentinelResult =
  | { kind: "miss" }
  | { kind: "hit"; responseStatus: number; responseBody: unknown }
  | { kind: "processing" }
  | { kind: "stale" }
  | { kind: "conflict" };

export function evaluateSentinel(input: {
  existing: SentinelRow | null;
  requestHash: string;
  now: Date;
}): SentinelResult {
  if (!input.existing) return { kind: "miss" };
  if (input.existing.requestHash !== input.requestHash) return { kind: "conflict" };

  if (input.existing.completedAt !== null && input.existing.responseStatus !== null) {
    return {
      kind: "hit",
      responseStatus: input.existing.responseStatus,
      responseBody: input.existing.responseBody,
    };
  }

  const age = input.now.getTime() - input.existing.createdAt.getTime();
  if (age > STALE_SENTINEL_MS) {
    return { kind: "stale" };
  }

  return { kind: "processing" };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function readSentinel(organizationId: string, key: string): Promise<SentinelRow | null> {
  const [row] = await db
    .select({
      requestHash: idempotencyKeys.requestHash,
      responseStatus: idempotencyKeys.responseStatus,
      responseBody: idempotencyKeys.responseBody,
      completedAt: idempotencyKeys.completedAt,
      createdAt: idempotencyKeys.createdAt,
    })
    .from(idempotencyKeys)
    .where(
      and(
        eq(idempotencyKeys.organizationId, organizationId),
        eq(idempotencyKeys.key, key),
        gt(idempotencyKeys.expiresAt, new Date()),
      ),
    );
  return row ?? null;
}

async function deleteSentinel(organizationId: string, key: string): Promise<void> {
  await db
    .delete(idempotencyKeys)
    .where(
      and(
        eq(idempotencyKeys.organizationId, organizationId),
        eq(idempotencyKeys.key, key),
      ),
    );
}

async function runAndStore(
  organizationId: string,
  key: string,
  rawBody: string,
  handler: (rawBody: string) => Promise<Response>,
): Promise<Response> {
  try {
    const response = await handler(rawBody);

    let responseBody: unknown;
    try {
      responseBody = await response.clone().json();
    } catch {
      await deleteSentinel(organizationId, key);
      return response;
    }

    await db
      .update(idempotencyKeys)
      .set({
        responseStatus: response.status,
        responseBody,
        completedAt: new Date(),
      })
      .where(
        and(
          eq(idempotencyKeys.organizationId, organizationId),
          eq(idempotencyKeys.key, key),
        ),
      );

    return response;
  } catch (err) {
    await deleteSentinel(organizationId, key);
    throw err;
  }
}

async function pollForSentinel(
  organizationId: string,
  key: string,
  rawBody: string,
  requestHash: string,
  handler: (rawBody: string) => Promise<Response>,
  deadline: number,
): Promise<Response> {
  while (Date.now() < deadline) {
    const row = await readSentinel(organizationId, key);
    const decision = evaluateSentinel({
      existing: row,
      requestHash,
      now: new Date(),
    });

    if (decision.kind === "hit") {
      return NextResponse.json(decision.responseBody, { status: decision.responseStatus });
    }

    if (decision.kind === "conflict") {
      return apiError(
        "idempotency_key_reused",
        "Idempotency-Key was reused with a different request body.",
        409,
      );
    }

    if (decision.kind === "miss") {
      return runIdempotency(organizationId, key, rawBody, requestHash, handler, deadline);
    }

    if (decision.kind === "stale") {
      await deleteSentinel(organizationId, key);
      return runIdempotency(organizationId, key, rawBody, requestHash, handler, deadline);
    }

    await sleep(POLL_INTERVAL_MS);
  }

  return apiError(
    "idempotency_processing_timeout",
    "Another request with the same Idempotency-Key is still processing. Retry after a short delay.",
    503,
  );
}

async function runIdempotency(
  organizationId: string,
  key: string,
  rawBody: string,
  requestHash: string,
  handler: (rawBody: string) => Promise<Response>,
  deadline: number,
): Promise<Response> {
  const reserveAttempt = await db
    .insert(idempotencyKeys)
    .values({
      organizationId,
      key,
      requestHash,
      expiresAt: new Date(Date.now() + TTL_MS),
    })
    .onConflictDoNothing()
    .returning({ requestHash: idempotencyKeys.requestHash });

  if (reserveAttempt.length > 0) {
    return runAndStore(organizationId, key, rawBody, handler);
  }

  return pollForSentinel(organizationId, key, rawBody, requestHash, handler, deadline);
}

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
  const deadline = Date.now() + MAX_POLL_DURATION_MS;

  return runIdempotency(organizationId, key, rawBody, requestHash, handler, deadline);
}
