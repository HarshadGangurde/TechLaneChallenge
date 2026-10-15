import { z } from "zod";
import { QUESTIONS_PER_RUN } from "@/lib/question-set";
import { isTrackId } from "@/lib/tracks";
import { AVAILABILITY_OPTIONS, DEFAULT_CAMPAIGN, DEFAULT_SOURCE } from "@/lib/constants";
import { CONSULTATION_FORMATS, CURRENT_STATUSES, TRACK_IDS } from "@/types";

/**
 * Normalise a mobile number to E.164 (+<country code><number>).
 * Returns null when it cannot be a valid international number. The country
 * code is mandatory so follow-up calls and WhatsApp work from anywhere.
 */
export function normalizePhone(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith("+") && !trimmed.startsWith("00")) return null;
  const digits = trimmed.replace(/^(\+|00)/, "").replace(/[\s().-]/g, "");
  if (!/^[1-9]\d{6,14}$/.test(digits)) return null;
  // India: +91 followed by a 10-digit mobile number starting 6-9.
  if (digits.startsWith("91") && !/^91[6-9]\d{9}$/.test(digits)) return null;
  return `+${digits}`;
}

// Strip control characters (incl. newlines) and collapse whitespace.
const CONTROL = /[\u0000-\u001f\u007f]/g;
const cleanText = (v: unknown) =>
  typeof v === "string" ? v.replace(CONTROL, " ").replace(/\s+/g, " ").trim() : v;

const text = (label: string, min: number, max: number) =>
  z.preprocess(
    cleanText,
    z
      .string({ error: `${label} is required.` })
      .min(min, min <= 1 ? `${label} is required.` : `${label} must be at least ${min} characters.`)
      .max(max, `${label} must be at most ${max} characters.`),
  );

const slug = /^[A-Za-z0-9_-]{1,50}$/;

export const leadPayloadSchema = z.object({
  name: text("Full name", 2, 100),
  phone: z
    .preprocess(cleanText, z.string({ error: "Mobile number is required." }).min(1, "Mobile number is required."))
    .transform((v, ctx) => {
      const n = normalizePhone(v);
      if (!n) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a valid mobile number with country code, e.g. +91 98765 43210.",
        });
        return z.NEVER;
      }
      return n;
    }),
  email: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : cleanText(v)),
    z.string().max(254, "Email is too long.").pipe(z.email("Enter a valid email address.")).optional(),
  ),
  organisation: text("College or organisation", 2, 150),
  status: z.enum(CURRENT_STATUSES, { error: "Select your current status." }),
  selectedTrack: z
    .string({ error: "Select a technology track." })
    .refine(isTrackId, "Select a valid technology track.")
    .transform((v) => v as (typeof TRACK_IDS)[number]),
  format: z.enum(CONSULTATION_FORMATS, { error: "Select a consultation format." }),
  availability: z.enum(AVAILABILITY_OPTIONS, { error: "Select when we can reach you." }),
  consent: z.literal(true, { error: "Please agree to be contacted about your consultation." }),
  marketingConsent: z.boolean().default(false),
  /** Raw challenge answers; the server recomputes recommendation and score itself. */
  answers: z.record(z.string().max(40), z.string().max(40)).refine((o) => Object.keys(o).length <= QUESTIONS_PER_RUN).optional(),
  source: z.string().regex(slug).optional().catch(undefined),
  campaign: z.string().regex(slug).optional().catch(undefined),
  idempotencyKey: z
    .string({ error: "Missing submission key." })
    .regex(/^[A-Za-z0-9_-]{16,64}$/, "Invalid submission key."),
  /** Honeypot: real users never fill this in. The route (not the schema) decides what to do with a filled value. */
  website: z.string().max(200).optional(),
});

export type LeadPayload = z.infer<typeof leadPayloadSchema>;

export interface FieldErrors {
  [field: string]: string;
}

export function parseLeadPayload(
  raw: unknown,
): { ok: true; data: LeadPayload } | { ok: false; errors: FieldErrors } {
  const result = leadPayloadSchema.safeParse(raw);
  if (result.success) {
    return {
      ok: true,
      data: {
        ...result.data,
        source: result.data.source ?? DEFAULT_SOURCE,
        campaign: result.data.campaign ?? DEFAULT_CAMPAIGN,
      },
    };
  }
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return { ok: false, errors };
}
