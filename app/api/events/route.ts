import { NextResponse } from "next/server";
import { z } from "zod";
import { ANALYTICS_EVENTS, sanitizeProps } from "@/lib/analytics";

export const runtime = "nodejs";

const schema = z.object({ event: z.enum(ANALYTICS_EVENTS), props: z.record(z.string(), z.unknown()).optional() });

/** First-party, PII-free event sink. Emits one structured log line per event. */
export async function POST(request: Request) {
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
