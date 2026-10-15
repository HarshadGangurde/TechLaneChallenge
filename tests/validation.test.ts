import { describe, expect, it } from "vitest";
import { normalizePhone, parseLeadPayload } from "@/lib/validation";

const valid = {
  name: "  Asha   Patil ",
  phone: "+91 98765 43210",
  email: "asha@example.com",
  organisation: "KK Wagh College",
  status: "college_student",
  selectedTrack: "mobile",
  format: "office_visit",
  availability: "Weekends",
  consent: true,
  marketingConsent: false,
  idempotencyKey: "abcdefghijklmnop1234",
};

describe("normalizePhone", () => {
  it.each([
    ["+91 98765 43210", "+919876543210"],
    ["+91-98765-43210", "+919876543210"],
    ["0091 98765 43210", "+919876543210"],
    ["+1 (415) 555-2671", "+14155552671"],
  ])("normalises %s", (input, out) => expect(normalizePhone(input)).toBe(out));

  it.each(["9876543210", "+91 12345 67890", "+91 98765", "abc", "+0123456789", "", "+1234"])("rejects %s", (input) =>
    expect(normalizePhone(input)).toBeNull(),
  );
});

describe("parseLeadPayload", () => {
  it("accepts a valid lead, normalising fields and applying defaults", () => {
    const r = parseLeadPayload(valid);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.name).toBe("Asha Patil");
      expect(r.data.phone).toBe("+919876543210");
      expect(r.data.email).toBe("asha@example.com");
      expect(r.data.campaign).toBe("GDG_NASHIK_DEVFEST_2026");
      expect(r.data.source).toBe("direct");
    }
  });

  it("rejects missing required fields with per-field messages", () => {
    const r = parseLeadPayload({ idempotencyKey: valid.idempotencyKey });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      for (const f of ["name", "phone", "email", "organisation", "status", "selectedTrack", "format", "availability", "consent"]) {
        expect(r.errors[f]).toBeTruthy();
      }
    }
  });

  it("rejects an invalid track id", () => {
    const r = parseLeadPayload({ ...valid, selectedTrack: "blockchain" });
    expect(!r.ok && r.errors.selectedTrack).toBeTruthy();
  });

  it("rejects a missing track (consultation cannot proceed without a selection)", () => {
    const { selectedTrack: _t, ...rest } = valid;
    void _t;
    const r = parseLeadPayload(rest);
    expect(!r.ok && r.errors.selectedTrack).toBeTruthy();
  });

  it.each([false, undefined, "true", 1])("rejects consent = %s", (consent) => {
    const r = parseLeadPayload({ ...valid, consent });
    expect(!r.ok && r.errors.consent).toBeTruthy();
  });

  it("rejects bad phone, email and enum values", () => {
    expect(parseLeadPayload({ ...valid, phone: "12345" }).ok).toBe(false);
    expect(parseLeadPayload({ ...valid, email: "not-an-email" }).ok).toBe(false);
    expect(parseLeadPayload({ ...valid, status: "alien" }).ok).toBe(false);
    expect(parseLeadPayload({ ...valid, format: "carrier-pigeon" }).ok).toBe(false);
    expect(parseLeadPayload({ ...valid, availability: "whenever" }).ok).toBe(false);
  });

  it("requires an email and rejects blank or whitespace-only values", () => {
    for (const email of ["", "   ", undefined]) {
      const r = parseLeadPayload({ ...valid, email });
      expect(r.ok, String(email)).toBe(false);
      if (!r.ok) expect(r.errors.email).toBe("Email is required.");
    }
  });
  it("accepts an email when supplied and keeps marketing consent separate", () => {
    const r = parseLeadPayload({ ...valid, email: "asha@example.com", marketingConsent: true });
    expect(r.ok && r.data.email).toBe("asha@example.com");
    expect(r.ok && r.data.marketingConsent).toBe(true);
  });

  it("strips control characters and newlines from text", () => {
    const r = parseLeadPayload({ ...valid, name: "Asha\nPatil\u0000" });
    expect(r.ok && r.data.name).toBe("Asha Patil");
  });

  it("falls back to defaults for malformed source/campaign params", () => {
    const r = parseLeadPayload({ ...valid, source: "<script>", campaign: "x y" });
    expect(r.ok && r.data.source).toBe("direct");
    expect(r.ok && r.data.campaign).toBe("GDG_NASHIK_DEVFEST_2026");
    const ok = parseLeadPayload({ ...valid, source: "booth" });
    expect(ok.ok && ok.data.source).toBe("booth");
  });

  it("requires an idempotency key and lets the route handle a filled honeypot", () => {
    expect(parseLeadPayload({ ...valid, idempotencyKey: "short" }).ok).toBe(false);
    const r = parseLeadPayload({ ...valid, website: "http://spam" });
    expect(r.ok && r.data.website).toBe("http://spam");
    expect(parseLeadPayload({ ...valid, website: "x".repeat(201) }).ok).toBe(false);
  });
});
