import { NextResponse } from "next/server";
import { ConfigError, getSheetsConfig } from "@/lib/config";
import { createSheetsGateway, StorageError } from "@/lib/google-sheets";
import { buildLeadRecord, saveLead } from "@/lib/lead-storage";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";
import { parseLeadPayload } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ipLimiter = createRateLimiter(40, 10 * 60_000); // venue Wi-Fi shares one IP, so keep this generous
const phoneLimiter = createRateLimiter(3, 60 * 60_000);
const seenRequests = new Set<string>();
const MAX_BODY_BYTES = 8_000;

const json = (body: object, status: number, headers?: HeadersInit) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

export async function POST(request: Request) {
  const ip = clientIp(request.headers);
  const rate = ipLimiter.check(ip);
  if (!rate.allowed) {
    return json({ ok: false, error: "rate_limited", message: "Too many requests. Please wait a moment and try again." }, 429, {
      "Retry-After": String(rate.retryAfterSec),
    });
  }

  const text = await request.text().catch(() => "");
  if (text.length > MAX_BODY_BYTES) return json({ ok: false, error: "payload_too_large" }, 413);
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return json({ ok: false, error: "invalid_json", message: "Invalid request." }, 400);
  }

  const parsed = parseLeadPayload(raw);
  if (!parsed.ok) {
    return json({ ok: false, error: "validation_failed", fieldErrors: parsed.errors }, 400);
  }
  const payload = parsed.data;

  // Honeypot filled in: pretend success so bots learn nothing, store nothing.
  if (payload.website) return json({ ok: true, leadId: "L-IGNORED" }, 200);

  // One phone number sending many *different* requests is spam. Repeats of the
  // same request (double-tap, retry after a failure) are not counted.
  const requestId = payload.phone + payload.idempotencyKey;
  if (!seenRequests.has(requestId)) {
    if (seenRequests.size > 5000) seenRequests.clear();
    seenRequests.add(requestId);
    if (!phoneLimiter.check(payload.phone).allowed) {
      return json({ ok: false, error: "rate_limited", message: "This number has submitted several requests recently. Please wait before trying again." }, 429);
    }
  }

  try {
    const gateway = createSheetsGateway(getSheetsConfig());
    const result = await saveLead(gateway, buildLeadRecord(payload));
    return json({ ok: true, leadId: result.leadId, duplicate: result.duplicate }, 200);
  } catch (err) {
    // Log the failure class only; never log the lead's contact details.
    if (err instanceof ConfigError) {
      console.error("[leads] configuration error:", err.message);
      return json({ ok: false, error: "not_configured", message: "Lead storage is not set up yet. Please tell the DeboisTech team." }, 503);
    }
    const kind = err instanceof StorageError ? `${err.kind}${err.status ? `:${err.status}` : ""}` : "unknown";
    console.error("[leads] save failed:", kind);
    return json({ ok: false, error: "storage_unavailable", message: "We could not save your request just now. Nothing was submitted. Please try again." }, 503);
  }
}
