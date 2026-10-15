import { beforeEach, describe, expect, it, vi } from "vitest";
import { StorageError, type SheetsGateway } from "@/lib/google-sheets";
import {
  _resetRecentLeadsForTests,
  buildLeadRecord,
  leadIdFromKey,
  recordToRow,
  SHEET_HEADERS,
  saveLead,
} from "@/lib/lead-storage";
import { QUESTIONS } from "@/lib/questions";
import { parseLeadPayload } from "@/lib/validation";

const answers = Object.fromEntries(QUESTIONS.map((q) => [q.id, q.kind === "knowledge" ? q.correctOptionId! : q.options[0].id]));

function payload(over: object = {}) {
  const r = parseLeadPayload({
    name: "Asha Patil",
    phone: "+91 98765 43210",
    email: "asha@example.com",
    organisation: "KK Wagh College",
    status: "college_student",
    selectedTrack: "mobile",
    format: "phone_call",
    availability: "Weekends",
    consent: true,
    marketingConsent: true,
    answers,
    source: "booth",
    idempotencyKey: "key-aaaaaaaaaaaaaaaaaaaa",
    ...over,
  });
  if (!r.ok) throw new Error(JSON.stringify(r.errors));
  return r.data;
}

function fakeGateway(overrides: Partial<SheetsGateway> = {}) {
  const rows: string[][] = [];
  const gw: SheetsGateway = {
    appendRow: vi.fn(async (v: string[]) => void rows.push(v)),
    readRows: vi.fn(async () => [[...SHEET_HEADERS], ...rows]),
    ...overrides,
  };
  return { gw, rows };
}
const noSleep = async () => {};

beforeEach(() => _resetRecentLeadsForTests());

describe("lead record mapping", () => {
  it("maps every column in the documented order", () => {
    const rec = buildLeadRecord(payload(), new Date("2026-10-25T10:00:00Z"));
    const row = recordToRow(rec);
    expect(row).toHaveLength(SHEET_HEADERS.length);
    const byHeader = Object.fromEntries(SHEET_HEADERS.map((h, i) => [h, row[i]]));
    expect(byHeader["Lead ID"]).toMatch(/^L-[0-9A-F]{12}$/);
    expect(byHeader["Created At"]).toBe("2026-10-25T10:00:00.000Z");
    expect(byHeader["Name"]).toBe("Asha Patil");
    expect(byHeader["Phone"]).toBe("+919876543210");
    expect(byHeader["Selected Track"]).toBe("Mobile App Development");
    expect(byHeader["Recommended Track"]).toBeTruthy();
    expect(byHeader["Challenge Score"]).toMatch(/^\d+\/\d+$/);
    expect(byHeader["Consultation Format"]).toBe("Phone call");
    expect(byHeader["Consultation Consent"]).toBe("Yes");
    expect(byHeader["Marketing Consent"]).toBe("Yes");
    expect(byHeader["Lead Source"]).toBe("booth");
    expect(byHeader["Campaign"]).toBe("GDG_NASHIK_DEVFEST_2026");
    expect(byHeader["Lead Status"]).toBe("New");
  });

  it("keeps the selected track even when it differs from the recommendation", () => {
    const rec = buildLeadRecord(payload({ selectedTrack: "fde" }));
    expect(rec.selectedTrack).toBe("Forward Deployed Engineering (FDE)");
    expect(rec.recommendedTrack).not.toBe(rec.selectedTrack);
  });

  it("computes recommendation server-side and leaves it blank without answers", () => {
    const rec = buildLeadRecord(payload({ answers: undefined }));
    expect(rec.recommendedTrack).toBe("");
    expect(rec.challengeScore).toBe("");
  });

  it("derives a stable lead id from the idempotency key", () => {
    expect(leadIdFromKey("abc")).toBe(leadIdFromKey("abc"));
    expect(leadIdFromKey("abc")).not.toBe(leadIdFromKey("abd"));
  });
});

describe("saveLead", () => {
  it("appends once on success", async () => {
    const { gw, rows } = fakeGateway();
    const res = await saveLead(gw, buildLeadRecord(payload()), { sleep: noSleep });
    expect(res.duplicate).toBe(false);
    expect(rows).toHaveLength(1);
  });

  it("treats a repeated submission as a duplicate and does not append again", async () => {
    const { gw, rows } = fakeGateway();
    const rec = buildLeadRecord(payload());
    await saveLead(gw, rec, { sleep: noSleep });
    const again = await saveLead(gw, rec, { sleep: noSleep });
    expect(again.duplicate).toBe(true);
    expect(rows).toHaveLength(1);
  });

  it("detects a lead already in the sheet (other instance) before appending", async () => {
    const { gw, rows } = fakeGateway();
    const rec = buildLeadRecord(payload());
    rows.push(recordToRow(rec));
    _resetRecentLeadsForTests();
    const res = await saveLead(gw, rec, { sleep: noSleep });
    expect(res.duplicate).toBe(true);
    expect(gw.appendRow).not.toHaveBeenCalled();
  });

  it("retries transient failures and succeeds", async () => {
    const { gw, rows } = fakeGateway();
    let calls = 0;
    gw.appendRow = vi.fn(async (v: string[]) => {
      if (++calls < 3) throw new StorageError("boom", "transient", 503);
      rows.push(v);
    });
    const res = await saveLead(gw, buildLeadRecord(payload()), { sleep: noSleep });
    expect(res.duplicate).toBe(false);
    expect(gw.appendRow).toHaveBeenCalledTimes(3);
    expect(rows).toHaveLength(1);
  });

  it("does NOT re-append when a 'failed' attempt actually wrote the row", async () => {
    const { gw, rows } = fakeGateway();
    gw.appendRow = vi.fn(async (v: string[]) => {
      rows.push(v); // Google accepted the write...
      throw new StorageError("timeout", "transient"); // ...but the response was lost
    });
    const res = await saveLead(gw, buildLeadRecord(payload()), { sleep: noSleep });
    expect(res.duplicate).toBe(true);
    expect(rows).toHaveLength(1);
    expect(gw.appendRow).toHaveBeenCalledTimes(1);
  });

  it("gives up after max attempts and surfaces the failure", async () => {
    const { gw } = fakeGateway();
    gw.appendRow = vi.fn(async () => {
      throw new StorageError("down", "transient", 503);
    });
    await expect(saveLead(gw, buildLeadRecord(payload()), { sleep: noSleep, maxAttempts: 3 })).rejects.toMatchObject({ kind: "transient" });
    expect(gw.appendRow).toHaveBeenCalledTimes(3);
  });

  it("does not retry permanent errors", async () => {
    const { gw } = fakeGateway();
    gw.appendRow = vi.fn(async () => {
      throw new StorageError("forbidden", "permanent", 403);
    });
    await expect(saveLead(gw, buildLeadRecord(payload()), { sleep: noSleep })).rejects.toMatchObject({ kind: "permanent" });
    expect(gw.appendRow).toHaveBeenCalledTimes(1);
  });
});
