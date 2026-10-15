import "server-only";
import { createHash } from "node:crypto";
import { DEFAULT_CAMPAIGN } from "@/lib/constants";
import { questionsForAnswers } from "@/lib/question-set";
import { recommend } from "@/lib/scoring";
import { getTrack } from "@/lib/tracks";
import { STATUS_LABELS, FORMAT_LABELS } from "@/lib/constants";
import { StorageError, type SheetsGateway } from "@/lib/google-sheets";
import type { LeadPayload } from "@/lib/validation";

export const SHEET_HEADERS = [
  "Lead ID",
  "Created At",
  "Name",
  "Phone",
  "Email",
  "College / Organisation",
  "Current Status",
  "Recommended Track",
  "Selected Track",
  "Challenge Score",
  "Consultation Format",
  "Preferred Availability",
  "Consultation Consent",
  "Marketing Consent",
  "Lead Source",
  "Campaign",
  "Lead Status",
  "Follow-up Notes",
] as const;

export interface LeadRecord {
  leadId: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  organisation: string;
  status: string;
  recommendedTrack: string;
  selectedTrack: string;
  challengeScore: string;
  format: string;
  availability: string;
  consent: string;
  marketingConsent: string;
  source: string;
  campaign: string;
  leadStatus: string;
  notes: string;
}

/** Deterministic ID from the client's idempotency key, so a retried write is recognisable. */
export function leadIdFromKey(key: string): string {
  return "L-" + createHash("sha256").update(key).digest("hex").slice(0, 12).toUpperCase();
}

export function buildLeadRecord(p: LeadPayload, now: Date = new Date()): LeadRecord {
  // Recompute recommendation and score server-side; never trust client-sent values.
  let recommendedTrack = "";
  let challengeScore = "";
  if (p.answers && Object.keys(p.answers).length > 0) {
    const r = recommend(p.answers, questionsForAnswers(p.answers));
    recommendedTrack = getTrack(r.primary).name;
    challengeScore = `${r.score.xp}/${r.score.maxXp}`;
  }
  return {
    leadId: leadIdFromKey(p.idempotencyKey),
    createdAt: now.toISOString(),
    name: p.name,
    phone: p.phone,
    email: p.email,
    organisation: p.organisation,
    status: STATUS_LABELS[p.status],
    recommendedTrack,
    selectedTrack: getTrack(p.selectedTrack).name,
    challengeScore,
    format: FORMAT_LABELS[p.format],
    availability: p.availability,
    consent: "Yes",
    marketingConsent: p.marketingConsent ? "Yes" : "No",
    source: p.source ?? "direct",
    campaign: p.campaign ?? DEFAULT_CAMPAIGN,
    leadStatus: "New",
    notes: "",
  };
}

export function recordToRow(r: LeadRecord): string[] {
  return [
    r.leadId, r.createdAt, r.name, r.phone, r.email, r.organisation, r.status,
    r.recommendedTrack, r.selectedTrack, r.challengeScore, r.format, r.availability,
    r.consent, r.marketingConsent, r.source, r.campaign, r.leadStatus, r.notes,
  ];
}

export interface SaveOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  sleep?: (ms: number) => Promise<void>;
}

export interface SaveResult {
  leadId: string;
  duplicate: boolean;
}

// Remembers leads saved by this instance so a double-tap never re-appends.
const recentLeadIds = new Set<string>();
const MAX_RECENT_LEADS = 10_000;
function rememberLead(id: string) {
  if (recentLeadIds.size >= MAX_RECENT_LEADS) {
    const oldest = recentLeadIds.values().next().value;
    if (oldest !== undefined) recentLeadIds.delete(oldest);
  }
  recentLeadIds.add(id);
}
export function _resetRecentLeadsForTests() {
  recentLeadIds.clear();
}

async function leadExists(gateway: SheetsGateway, leadId: string): Promise<boolean> {
  const rows = await gateway.readRows();
  return rows.some((row) => row[0] === leadId);
}

/**
 * Append a lead exactly once.
 *
 * A failed append can still have written the row (e.g. a timeout after Google
 * accepted it), so a blind retry could create duplicates. Before every retry we
 * look up the deterministic Lead ID in the sheet: if it is already there, the
 * earlier attempt succeeded. Only transient errors are retried, with backoff.
 */
export async function saveLead(
  gateway: SheetsGateway,
  record: LeadRecord,
  { maxAttempts = 3, baseDelayMs = 400, sleep = (ms) => new Promise((r) => setTimeout(r, ms)) }: SaveOptions = {},
): Promise<SaveResult> {
  if (recentLeadIds.has(record.leadId)) return { leadId: record.leadId, duplicate: true };

  let lastError: StorageError | undefined;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Always look first: a previous request (maybe on another instance, maybe
      // one that timed out after Google accepted it) may already have written it.
      if (await leadExists(gateway, record.leadId).catch(() => false)) {
        rememberLead(record.leadId);
        return { leadId: record.leadId, duplicate: true };
      }
      await gateway.appendRow(recordToRow(record));
      rememberLead(record.leadId);
      return { leadId: record.leadId, duplicate: false };
    } catch (err) {
      lastError = err instanceof StorageError ? err : new StorageError("Unexpected storage failure", "transient");
      if (lastError.kind !== "transient" || attempt === maxAttempts) break;
      await sleep(baseDelayMs * 2 ** (attempt - 1));
    }
  }
  throw lastError!;
}

/**
 * Classify a sheet's first row: "match" (exact header), "none" (data starts in
 * row 1), or "mismatch" (looks like a header but columns differ, which would
 * silently mis-map every export column).
 */
export function headerRowStatus(firstRow: string[] | undefined): "match" | "none" | "mismatch" {
  if (!firstRow || firstRow[0] !== SHEET_HEADERS[0]) return "none";
  return SHEET_HEADERS.every((h, i) => firstRow[i] === h) ? "match" : "mismatch";
}
