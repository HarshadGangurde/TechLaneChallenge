"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, ButtonLink, Spinner } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { track } from "@/lib/analytics";
import { AVAILABILITY_OPTIONS, FORMAT_LABELS, STATUS_LABELS } from "@/lib/constants";
import { session, useSelectedTrack } from "@/lib/session";
import { getTrack, isTrackId, TRACK_LIST } from "@/lib/tracks";
import { parseLeadPayload, type FieldErrors } from "@/lib/validation";

interface FormState {
  name: string;
  phone: string;
  email: string;
  organisation: string;
  status: string;
  format: string;
  availability: string;
  consent: boolean;
  marketingConsent: boolean;
  website: string;
}

const initial: FormState = {
  name: "", phone: "+91 ", email: "", organisation: "", status: "", format: "", availability: "",
  consent: false, marketingConsent: false, website: "",
};

const FIELD_ORDER = ["name", "phone", "email", "selectedTrack", "status", "organisation", "format", "availability", "consent"];
const PRIVACY_CONTACT = process.env.NEXT_PUBLIC_PRIVACY_CONTACT;

export function ConsultationForm() {
  const router = useRouter();
  const selected = useSelectedTrack();
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const opened = useRef(false);

  useEffect(() => {
    if (selected && !opened.current) {
      opened.current = true;
      track("consultation_form_opened", { track: selected, source: session.getSource() });
    }
  }, [selected]);

  if (selected === undefined) return <div className="mt-10 h-64 animate-pulse rounded-2xl bg-panel" aria-label="Loading form" />;

  // Consultation registration is not reachable without an explicit track choice.
  if (!selected) {
    return (
      <section className="animate-rise pt-12 text-center">
        <h1 className="text-3xl font-extrabold">Choose your track first</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">Pick the technology track you want to discuss, then you can request your free consultation.</p>
        <ButtonLink href="/results" className="mt-6">Go to my results</ButtonLink>
      </section>
    );
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!e[key]) return e;
      const { [key]: _removed, ...rest } = e;
      void _removed;
      return rest;
    });
  };

  function focusFirstError(errs: FieldErrors) {
    const key = FIELD_ORDER.find((k) => errs[k]);
    if (key) formRef.current?.querySelector<HTMLElement>(`#${key === "consent" ? "consent" : key}`)?.focus();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setBanner(null);

    const payload = {
      ...form,
      email: form.email,
      selectedTrack: selected,
      answers: session.getAnswers(),
      source: session.getSource(),
      campaign: session.getCampaign(),
      idempotencyKey: session.getIdempotencyKey(),
    };

    const check = parseLeadPayload(payload);
    if (!check.ok) {
      setErrors(check.errors);
      requestAnimationFrame(() => focusFirstError(check.errors));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; leadId?: string; fieldErrors?: FieldErrors; message?: string; error?: string };

      if (res.ok && data.ok && data.leadId) {
        track("consultation_submitted", { track: selected, source: session.getSource() });
        session.markSubmitted(data.leadId);
        router.push("/confirmation");
        return;
      }
      if (res.status === 400 && data.fieldErrors) {
        setErrors(data.fieldErrors);
        setBanner("Please check the highlighted fields.");
        requestAnimationFrame(() => focusFirstError(data.fieldErrors!));
      } else {
        setBanner(data.message ?? "We could not save your request. Nothing was submitted. Please try again.");
      }
      track("consultation_save_failed", { reason: data.error ?? `http_${res.status}` });
    } catch {
      setBanner("We could not reach the server. Check your connection and try again. Nothing was submitted.");
      track("consultation_save_failed", { reason: "network" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="animate-rise pt-2">
      <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">YOUR NEXT STEP STARTS HERE</h1>
      <p className="mt-3 text-muted">
        Request a free consultation with DeboisTech to discuss your selected technology path, learning roadmap,
        project opportunities, and relevant upcoming programs.
      </p>

      <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-6 space-y-5" aria-busy={submitting}>
        {banner && (
          <div role="alert" className="rounded-xl border border-danger/60 bg-danger/10 p-4 text-sm">
            <p className="font-semibold text-danger">{banner}</p>
            {!Object.keys(errors).length && <p className="mt-1 text-muted">Your answers are still here. Press “Request Free Consultation” to retry.</p>}
          </div>
        )}
        <p className="text-xs text-muted"><span className="text-brand">*</span> required</p>

        <Field id="name" label="Full name" required error={errors.name}>
          {(p) => <input {...p} className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" maxLength={100} />}
        </Field>

        <Field id="phone" label="Mobile number with country code" required error={errors.phone} hint="Example: +91 98765 43210">
          {(p) => <input {...p} className={inputClass} type="tel" inputMode="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" placeholder="+91 " maxLength={24} />}
        </Field>

        <Field id="email" label="Email" required error={errors.email} hint="We will send your consultation details here.">
          {(p) => <input {...p} className={inputClass} type="email" inputMode="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" maxLength={254} />}
        </Field>

        <Field id="selectedTrack" label="Technology track" required error={errors.selectedTrack} hint="Pre-filled with the track you chose. You can change it.">
          {(p) => (
            <select {...p} className={inputClass} value={selected} onChange={(e) => isTrackId(e.target.value) && (session.setSelectedTrack(e.target.value), track("track_selected", { track: e.target.value, source: session.getSource() }))}>
              {TRACK_LIST.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          )}
        </Field>

        <Field id="status" label="Current status" required error={errors.status}>
          {(p) => (
            <select {...p} className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="">Select…</option>
              {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          )}
        </Field>

        <Field id="organisation" label="College or organisation" required error={errors.organisation}>
          {(p) => <input {...p} className={inputClass} value={form.organisation} onChange={(e) => set("organisation", e.target.value)} autoComplete="organization" maxLength={150} />}
        </Field>

        <fieldset aria-describedby={errors.format ? "format-error" : undefined}>
          <legend className="mb-1.5 text-sm font-semibold">Preferred consultation format <span className="text-brand">*</span></legend>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(FORMAT_LABELS).map(([v, l], i) => (
              <label key={v} className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 px-4 py-3 has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-brand ${form.format === v ? "border-brand bg-brand/10" : "border-line bg-panel"}`}>
                <input id={i === 0 ? "format" : undefined} type="radio" name="format" value={v} checked={form.format === v} onChange={() => set("format", v)} className="accent-[#22d367]" />
                {l}
              </label>
            ))}
          </div>
          {errors.format && <p id="format-error" role="alert" className="mt-1 text-sm font-medium text-danger">{errors.format}</p>}
        </fieldset>

        <Field id="availability" label="Preferred contact availability" required error={errors.availability}>
          {(p) => (
            <select {...p} className={inputClass} value={form.availability} onChange={(e) => set("availability", e.target.value)}>
              <option value="">Select…</option>
              {AVAILABILITY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          )}
        </Field>

        <div className="space-y-3 rounded-2xl border border-line bg-panel p-4 text-sm">
          <p className="text-muted">
            We collect your details only so the DeboisTech team can contact you about your free consultation on{" "}
            <strong className="text-white">{getTrack(selected).name}</strong>.{" "}
            {PRIVACY_CONTACT ? `To correct or delete your details, contact ${PRIVACY_CONTACT}.` : "To correct or delete your details, ask any DeboisTech team member."}
          </p>
          <label className="flex cursor-pointer items-start gap-3">
            <input id="consent" type="checkbox" checked={form.consent} onChange={(e) => set("consent", e.target.checked)} aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "consent-error" : undefined} className="mt-1 size-5 shrink-0 accent-[#22d367]" />
            <span>I agree that DeboisTech may contact me about my consultation request. <span className="text-brand">*</span></span>
          </label>
          {errors.consent && <p id="consent-error" role="alert" className="font-medium text-danger">{errors.consent}</p>}
          <label className="flex cursor-pointer items-start gap-3">
            <input id="marketingConsent" type="checkbox" checked={form.marketingConsent} onChange={(e) => set("marketingConsent", e.target.checked)} className="mt-1 size-5 shrink-0 accent-[#22d367]" />
            <span>Also keep me updated about DeboisTech workshops and programs. <span className="text-muted">(optional)</span></span>
          </label>
        </div>

        {/* Honeypot: hidden from people and assistive tech, bots fill it in. */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>Leave this field empty<input tabIndex={-1} autoComplete="off" name="hp_ref_code" data-lpignore="true" data-1p-ignore="true" data-form-type="other" value={form.website} onChange={(e) => set("website", e.target.value)} /></label>
        </div>

        <Button type="submit" disabled={submitting} className="w-full text-lg">
          {submitting ? <><Spinner /> Submitting…</> : banner && !Object.keys(errors).length ? "Retry submission" : "Request Free Consultation"}
        </Button>
      </form>
    </section>
  );
}
