import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { ConfigError, getAdminToken, getSheetsConfig } from "@/lib/config";
import { toCsv } from "@/lib/csv";
import { createSheetsGateway } from "@/lib/google-sheets";
import { headerRowStatus, SHEET_HEADERS } from "@/lib/lead-storage";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const failedAuth = createRateLimiter(10, 10 * 60_000);
const noStore = { "Cache-Control": "no-store" };

const digest = (v: string) => createHash("sha256").update(v).digest();

export function tokenMatches(provided: string, expected: string): boolean {
  return timingSafeEqual(digest(provided), digest(expected));
}

/**
 * Staff-only CSV export. Access control: a long random ADMIN_EXPORT_TOKEN sent
 * in the Authorization header (never in the URL, so it cannot leak into logs,
 * history or referrers). Without a configured token the endpoint is disabled.
 */
export async function GET(request: Request) {
  const expected = getAdminToken();
  if (!expected) {
    return NextResponse.json({ error: "Export is disabled: set ADMIN_EXPORT_TOKEN (24+ characters)." }, { status: 503, headers: noStore });
  }

  const ip = clientIp(request.headers);
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!provided || !tokenMatches(provided, expected)) {
    const r = failedAuth.check(ip);
    return NextResponse.json(
      { error: r.allowed ? "Unauthorized" : "Too many attempts" },
      { status: r.allowed ? 401 : 429, headers: { ...noStore, "WWW-Authenticate": "Bearer" } },
    );
  }

  try {
    const rows = await createSheetsGateway(getSheetsConfig()).readRows();
    const status = headerRowStatus(rows[0]);
    if (status === "mismatch") {
      console.error("[export] sheet header row does not match the expected columns A-R");
      return NextResponse.json(
        { error: "The sheet's header row does not match the expected columns. Fix row 1 (see SETUP.md) and try again." },
        { status: 500, headers: noStore },
      );
    }
    const data = status === "match" ? rows.slice(1) : rows;
    const csv = "﻿" + toCsv(SHEET_HEADERS, data.map((r) => SHEET_HEADERS.map((_, i) => r[i] ?? "")));
    const day = new Date().toISOString().slice(0, 10);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        ...noStore,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="tech-lane-leads-${day}.csv"`,
        "X-Robots-Tag": "noindex",
      },
    });
  } catch (err) {
    console.error("[export] failed:", err instanceof ConfigError ? err.message : err instanceof Error ? err.name : "unknown");
    return NextResponse.json({ error: "Could not read leads from Google Sheets." }, { status: 503, headers: noStore });
  }
}
