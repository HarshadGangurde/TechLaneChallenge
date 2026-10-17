"use client";

import { ButtonLink } from "@/components/ui/button";
import { useSubmittedLead } from "@/lib/session";

/** Closing panel of a roadmap page. Offers the consultation, or a thank-you once one has been requested. */
export function RoadmapCta() {
  const submitted = useSubmittedLead();
  const done = !!submitted;
  return (
    <section className="nb-card mt-8 flex flex-col items-start gap-4 bg-brand p-6 text-white">
      <h2 className="font-display text-2xl font-extrabold leading-tight">{done ? "Your consultation request is in" : "Want help along the way?"}</h2>
      <p className="font-medium text-white">
        {done ? "The DeboisTech team will contact you to talk through this path." : "Talk to the DeboisTech team about this path in a free consultation."}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        {!done && <ButtonLink href="/consultation" variant="secondary">Request Free Consultation</ButtonLink>}
        <ButtonLink href={done ? "/confirmation" : "/results"} variant="secondary">{done ? "← Back" : "← Back to my results"}</ButtonLink>
      </div>
    </section>
  );
}
