import { NextResponse } from "next/server";
import { z } from "zod";
import { ANALYTICS_EVENTS, sanitizeProps } from "@/lib/analytics";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Generous: a venue shares one IP and each student fires ~10 events, but this stops log flooding.
const ipLimiter = createRateLimiter(600, 10 * 60_000);

const schema = z.object({ event: z.enum(ANALYTICS_EVENTS), props: z.record(z.string(), z.unknown()).optional() });

/** First-party, PII-free event sink. Emits one structured log line per event. */
export async function POST(request: Request) {
  if (!ipLimiter.check(clientIp(request.headers)).allowed) return new NextResponse(null, { status: 429 });
  const text = await request.text().catch(() => "");
  if (text.length > 2000) return new NextResponse(null, { status: 413 });
  try {
    const { event, props } = schema.parse(JSON.parse(text));
    console.log(JSON.stringify({ type: "analytics", event, props: sanitizeProps(props), at: new Date().toISOString() }));
    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 400 });
  }
}
