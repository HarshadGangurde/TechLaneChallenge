"use client";

import { useSyncExternalStore } from "react";
import { isTrackId } from "@/lib/tracks";
import type { Answers, TrackId } from "@/types";

/**
 * Challenge progress lives in sessionStorage only (nothing personal), so a
 * page refresh keeps progress but closing the tab starts fresh.
 */
const KEYS = {
  answers: "tlc:answers",
  selected: "tlc:selected",
  idem: "tlc:idem",
  source: "tlc:source",
  campaign: "tlc:campaign",
  submitted: "tlc:submitted",
} as const;

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function read(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    /* private mode: degrade to in-memory-only for this render */
  }
  notify();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

/** Subscribe to one raw storage value. Returns undefined on the server / before hydration. */
function useRaw(key: string): string | null | undefined {
  return useSyncExternalStore(
    subscribe,
    () => read(key),
    () => undefined,
  );
}

export function parseAnswers(raw: string | null | undefined): Answers {
  if (!raw) return {};
  try {
    const v = JSON.parse(raw);
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Answers) : {};
  } catch {
    return {};
  }
}

export function useAnswersRaw() {
  return useRaw(KEYS.answers);
}
export function useSelectedTrack(): TrackId | null | undefined {
  const raw = useRaw(KEYS.selected);
  if (raw === undefined) return undefined;
  return isTrackId(raw) ? raw : null;
}
export function useSubmittedLead(): string | null | undefined {
  return useRaw(KEYS.submitted);
}

export const session = {
  getAnswers: () => parseAnswers(read(KEYS.answers)),
  setAnswer(questionId: string, optionId: string) {
    const current = parseAnswers(read(KEYS.answers));
    if (current[questionId]) return; // first answer wins: no duplicate scoring
    write(KEYS.answers, JSON.stringify({ ...current, [questionId]: optionId }));
  },
  resetChallenge() {
    write(KEYS.answers, null);
    write(KEYS.selected, null);
  },
  setSelectedTrack: (id: TrackId) => write(KEYS.selected, id),
  getSelectedTrack: () => {
    const v = read(KEYS.selected);
    return isTrackId(v) ? v : null;
  },
  /** Stable per form session so retries and double-taps map to the same lead. */
  getIdempotencyKey(): string {
    let key = read(KEYS.idem);
    if (!key) {
      key = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`)
        .replace(/[^A-Za-z0-9_-]/g, "")
        .padEnd(16, "0");
      write(KEYS.idem, key);
    }
    return key;
  },
  markSubmitted(leadId: string) {
    write(KEYS.submitted, leadId);
    write(KEYS.idem, null); // a later request is a new, intentional consultation
  },
  clearSubmitted: () => write(KEYS.submitted, null),
  captureCampaignParams() {
    const p = new URLSearchParams(window.location.search);
    const slug = /^[A-Za-z0-9_-]{1,50}$/;
    const src = p.get("src") ?? p.get("utm_source");
    const campaign = p.get("campaign") ?? p.get("utm_campaign");
    if (src && slug.test(src)) write(KEYS.source, src);
    if (campaign && slug.test(campaign)) write(KEYS.campaign, campaign);
  },
  getSource: () => read(KEYS.source) ?? undefined,
  getCampaign: () => read(KEYS.campaign) ?? undefined,
};
