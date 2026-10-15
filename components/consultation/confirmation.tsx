"use client";

import { ButtonLink } from "@/components/ui/button";
import { session, useSubmittedLead } from "@/lib/session";

export function Confirmation() {
  const leadId = useSubmittedLead();
  if (leadId === undefined) return <div className="mt-10 h-48 animate-pulse rounded-2xl bg-panel" aria-label="Loading" />;

  if (!leadId) {
    return (
      <section className="animate-rise pt-12 text-center">
        <h1 className="text-3xl font-extrabold">Nothing submitted yet</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">We have no consultation request from this session.</p>
        <ButtonLink href="/" className="mt-6">Back to start</ButtonLink>
      </section>
    );
  }

  return (
    <section className="animate-rise pt-10 text-center">
      <div className="animate-pop mx-auto grid size-20 place-items-center rounded-full bg-brand text-4xl text-black" aria-hidden>✓</div>
      <h1 className="mt-6 text-3xl font-extrabold leading-tight" role="status">Your consultation request has been submitted successfully!</h1>
      <p className="mx-auto mt-4 max-w-md text-[#cfe0d6]">
        The DeboisTech team will contact you using the details you provided to coordinate your free consultation.
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted">
        This is a request, not a confirmed appointment. The team will confirm a time with you separately. Meanwhile, keep exploring and building.
      </p>
      <p className="mt-5 font-mono text-xs text-muted">Reference: {leadId}</p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <ButtonLink href="/" variant="secondary" onClick={() => { session.clearSubmitted(); session.resetChallenge(); }}>
          Done
        </ButtonLink>
      </div>
    </section>
  );
}
