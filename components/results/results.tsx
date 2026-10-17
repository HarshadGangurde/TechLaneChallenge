"use client";

import { useMemo } from "react";
import { MatchChart } from "@/components/results/match-chart";
import { CompactTrackCard, FeaturedTrackCard } from "@/components/results/track-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { explainRecommendation } from "@/lib/explain";
import { recommend } from "@/lib/scoring";
import { parseAnswers, session, useAnswersRaw, useQuestionSet, useSelectedTrack } from "@/lib/session";
import { getTrack, TRACK_LIST } from "@/lib/tracks";
import type { TrackId } from "@/types";

export function Results() {
  const raw = useAnswersRaw();
  const selected = useSelectedTrack();
  const answers = useMemo(() => parseAnswers(raw), [raw]);
  const questions = useQuestionSet();
  const complete = !!questions?.length && questions.every((q) => answers[q.id]);
  const rec = useMemo(() => (complete && questions ? recommend(answers, questions) : null), [complete, answers, questions]);

  if (raw === undefined || selected === undefined || questions === undefined) {
    return <div className="mt-10 h-64 animate-pulse rounded-2xl bg-panel" aria-label="Loading results" />;
  }

  if (!rec) {
    return (
      <section className="animate-rise pt-12 text-center">
        <h1 className="text-3xl font-extrabold">No result yet</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">Finish the short challenge first and we will suggest a tech lane. It takes about 2–4 minutes.</p>
        <ButtonLink href="/challenge" className="mt-6">{Object.keys(answers).length ? "Continue challenge" : "Start Challenge"}</ButtonLink>
      </section>
    );
  }

  function choose(id: TrackId) {
    session.setSelectedTrack(id);
    track("track_selected", { track: id, recommended_track: rec!.primary, source: session.getSource() });
  }

  const primary = getTrack(rec.primary);
  const secondary = rec.secondary ? getTrack(rec.secondary) : null;
  const others = TRACK_LIST.filter((t) => t.id !== rec.primary && t.id !== rec.secondary);

  return (
    <div className="pb-40 pt-2">
      <p className="font-mono text-sm uppercase tracking-widest text-brand-strong">Your suggested tech lane</p>
      <h1 className="sr-only">Your track recommendation</h1>

      <div className="mt-3">
        <FeaturedTrackCard
          track={primary}
          selected={selected === primary.id}
          onChoose={choose}
          badge="★ Best match"
          featured
          explanation={explainRecommendation(rec, questions ?? [])}
        />
      </div>

      {secondary && (
        <div className="mt-4">
          <FeaturedTrackCard track={secondary} selected={selected === secondary.id} onChoose={choose} badge="Also a strong fit" />
        </div>
      )}

      <MatchChart ranking={rec.ranking} scores={rec.scores} />

      <section aria-labelledby="others" className="mt-8">
        <h2 id="others" className="text-lg font-bold">Explore {secondary ? "other" : "the other"} tracks</h2>
        <p className="mt-1 text-sm text-muted">This is only a suggestion. You can choose any track that interests you.</p>
        <div className="mt-3 grid gap-3">
          {others.map((t) => (
            <CompactTrackCard key={t.id} track={t} selected={selected === t.id} onChoose={choose} />
          ))}
        </div>
      </section>

      <p className="mt-6 text-xs text-muted">
        Based on a short, rule-based quiz. It is guidance to help you explore, not a prediction of your career or ability.
      </p>
      <Button variant="ghost" className="mt-2" onClick={() => session.resetChallenge()}>
        Retake the challenge
      </Button>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t-2 border-ink bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p aria-live="polite" className="text-sm text-muted sm:max-w-xs">
            {selected ? <>Your track: <strong className="text-ink">{getTrack(selected).name}</strong></> : "Choose a track above to unlock your free consultation request."}
          </p>
          <div className="grid grid-cols-[3fr_2fr] gap-2 sm:flex sm:shrink-0">
            <ButtonLink href={`/roadmap/${rec.primary}`} variant="secondary" className="px-2 text-[13px] leading-tight sm:px-6 sm:text-base">
              Get your personalized roadmap
            </ButtonLink>
            {selected ? (
              <ButtonLink href="/consultation" className="px-2 text-[13px] leading-tight sm:px-6 sm:text-base">Request Free Consultation</ButtonLink>
            ) : (
              <Button disabled aria-disabled="true" className="px-2 text-[13px] leading-tight sm:px-6 sm:text-base">Request Free Consultation</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
