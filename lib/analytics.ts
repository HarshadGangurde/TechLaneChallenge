/**
 * Privacy-safe funnel analytics. Only allow-listed event names and a few
 * non-identifying properties are ever sent; names, phones and emails are never
 * accepted here. Providers are pluggable via `registerProvider`.
 */
export const ANALYTICS_EVENTS = [
  "landing_view",
  "challenge_started",
  "challenge_completed",
  "track_recommended",
  "track_selected",
  "consultation_form_opened",
  "consultation_submitted",
  "consultation_save_failed",
  "roadmap_viewed",
] as const;
export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

export const ALLOWED_PROPS = ["track", "recommended_track", "source", "xp", "reason"] as const;
export type AnalyticsProps = Partial<Record<(typeof ALLOWED_PROPS)[number], string | number>>;

export type AnalyticsProvider = (event: AnalyticsEvent, props: AnalyticsProps) => void;

export function sanitizeProps(props: Record<string, unknown> = {}): AnalyticsProps {
  const out: AnalyticsProps = {};
  for (const key of ALLOWED_PROPS) {
    const v = props[key];
    if (typeof v === "number" && Number.isFinite(v)) out[key] = v;
    else if (typeof v === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(v)) out[key] = v;
  }
  return out;
}

const providers: AnalyticsProvider[] = [
  // Default provider: first-party endpoint that writes a structured log line.
  (event, props) => {
    if (typeof navigator === "undefined") return;
    const body = JSON.stringify({ event, props });
    try {
      if (!navigator.sendBeacon?.("/api/events", new Blob([body], { type: "application/json" }))) {
        void fetch("/api/events", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } });
      }
    } catch {
      /* analytics must never break the app */
    }
  },
];

export function registerProvider(p: AnalyticsProvider) {
  providers.push(p);
}

export function track(event: AnalyticsEvent, props?: Record<string, unknown>) {
  const clean = sanitizeProps(props);
  for (const p of providers) {
    try {
      p(event, clean);
    } catch {
      /* ignore provider failures */
    }
  }
}
