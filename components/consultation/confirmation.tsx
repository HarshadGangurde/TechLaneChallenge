"use client";

import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { useMemo } from "react";
import { recommend } from "@/lib/scoring";
import { parseAnswers, session, useAnswersRaw, useQuestionSet, useSelectedTrack, useSubmittedLead } from "@/lib/session";

export function Confirmation() {
  const leadId = useSubmittedLead();
  const raw = useAnswersRaw();
  const questions = useQuestionSet();
  const selected = useSelectedTrack();
  // Roadmap for the track the student chose; falls back to the suggested one if no choice is stored.
  const roadmapTrack = useMemo(() => {
    if (selected) return selected;
    const answers = parseAnswers(raw);
    if (questions && questions.length && questions.every((q) => answers[q.id])) return recommend(answers, questions).primary;
    return null;
  }, [raw, questions, selected]);
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
      <div className="animate-pop nb-shadow relative mx-auto grid size-32 -rotate-3 place-items-center rounded-[2rem] border-2 border-ink bg-lane-sun" aria-hidden>
        <Image src="/logo.png" alt="" width={96} height={57} priority className="h-auto w-24" />
        <span className="absolute -bottom-3 -right-3 grid size-9 place-items-center rounded-full border-4 border-ink bg-brand text-lg font-bold text-white">✓</span>
      </div>
      <h1 className="mt-6 text-3xl font-extrabold leading-tight">Your consultation request has been submitted successfully!</h1>
      <p role="status" className="sr-only">Your consultation request was submitted.</p>
      <p className="mx-auto mt-4 max-w-md text-[#3e3730]">
        The DeboisTech team will contact you on the details you shared to confirm a time for your free consultation.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        {roadmapTrack && (
          <ButtonLink href={`/roadmap/${roadmapTrack}`} className="w-full max-w-sm">
            Get your personalized roadmap →
          </ButtonLink>
        )}
        <ButtonLink href="/" variant="secondary" onClick={() => { session.clearSubmitted(); session.resetChallenge(); }}>
          Done
        </ButtonLink>
      </div>
    </section>
  );
}
