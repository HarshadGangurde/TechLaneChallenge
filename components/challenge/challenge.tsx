"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { QUESTIONS } from "@/lib/questions";
import { isCorrect, recommend, scoreAnswers, XP_CORRECT, XP_PREFERENCE } from "@/lib/scoring";
import { parseAnswers, session, useAnswersRaw } from "@/lib/session";

const TOTAL = QUESTIONS.length;

export function Challenge() {
  const raw = useAnswersRaw();
  const answers = useMemo(() => parseAnswers(raw), [raw]);
  const [index, setIndex] = useState<number | null>(null);
  const startedRef = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const focusNext = useRef(false);
  const mounted = useRef(false);

  const firstUnanswered = QUESTIONS.findIndex((q) => !answers[q.id]);
  // Resume where the student left off, then stay put: the index must not follow
  // "first unanswered" or the screen would jump ahead as soon as an answer saves.
  if (index === null && raw !== undefined) setIndex(firstUnanswered === -1 ? TOTAL : firstUnanswered);
  const current = index ?? 0;
  const { xp, maxXp, correct, knowledgeTotal } = useMemo(() => scoreAnswers(answers), [answers]);

  useEffect(() => {
    if (raw !== undefined && !startedRef.current && Object.keys(answers).length === 0) {
      startedRef.current = true;
      track("challenge_started", { source: session.getSource() });
    }
  }, [raw, answers]);

  const question = QUESTIONS[current];
  const chosen = question ? answers[question.id] : undefined;

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [current]);

  useEffect(() => {
    if (focusNext.current && chosen) {
      focusNext.current = false;
      nextRef.current?.focus();
    }
  }, [chosen]);

  if (raw === undefined) return <div className="mt-10 h-64 animate-pulse rounded-2xl bg-panel" aria-label="Loading challenge" />;

  function pick(optionId: string) {
    if (!question || answers[question.id]) return; // answers are locked once given
    focusNext.current = true;
    session.setAnswer(question.id, optionId);
  }

  function next() {
    if (current < TOTAL - 1) return setIndex(current + 1);
    const rec = recommend(answers);
    track("challenge_completed", { xp: rec.score.xp, source: session.getSource() });
    track("track_recommended", { recommended_track: rec.primary, source: session.getSource() });
    setIndex(TOTAL);
  }

  if (!question) {
    return <Completion xp={xp} maxXp={maxXp} correct={correct} knowledgeTotal={knowledgeTotal} onReview={() => setIndex(TOTAL - 1)} />;
  }

  const answeredCount = QUESTIONS.filter((q) => answers[q.id]).length;
  const wasCorrect = chosen ? isCorrect(question, chosen) : false;
  const gain = chosen ? (question.kind === "knowledge" ? (wasCorrect ? XP_CORRECT : 0) : XP_PREFERENCE) : 0;

  return (
    <section aria-labelledby="q-heading" className="pt-2">
      <div className="flex items-center justify-between font-mono text-sm">
        <span aria-live="polite">Question {current + 1} of {TOTAL}</span>
        <span className="relative rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-brand" aria-label={`${xp} XP earned`}>
          {xp} XP
          {chosen && gain > 0 && (
            <span key={question.id} aria-hidden className="animate-float-xp absolute -top-1 right-2 text-xs font-bold">+{gain}</span>
          )}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={TOTAL}
        aria-valuenow={answeredCount}
        aria-label="Challenge progress"
        className="mt-3 h-2 overflow-hidden rounded-full bg-panel-2"
      >
        <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${(answeredCount / TOTAL) * 100}%` }} />
      </div>

      <div key={question.id} className="animate-rise mt-6">
        <p className="font-mono text-xs uppercase tracking-widest text-brand">{question.category}</p>
        <h1 id="q-heading" ref={headingRef} tabIndex={-1} className="mt-2 text-2xl font-bold leading-snug outline-none sm:text-3xl">
          {question.prompt}
        </h1>
        {question.snippet && (
          <pre className="mt-4 overflow-x-auto rounded-xl border border-line bg-black/50 p-4 font-mono text-sm leading-relaxed"><code>{question.snippet}</code></pre>
        )}

        <div role="group" aria-label="Answer options" className="mt-5 grid gap-3">
          {question.options.map((o) => {
            const selected = chosen === o.id;
            const reveal = !!chosen && question.kind === "knowledge";
            const isRight = reveal && o.id === question.correctOptionId;
            const isWrong = reveal && selected && !isRight;
            const tone = isRight
              ? "border-brand bg-brand/15"
              : isWrong
                ? "border-danger bg-danger/10"
                : selected
                  ? "border-brand bg-brand/10"
                  : "border-line bg-panel hover:border-brand/60";
            return (
              <button
                key={o.id}
                type="button"
                aria-pressed={selected}
                aria-disabled={!!chosen}
                onClick={() => pick(o.id)}
                className={`flex min-h-14 w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left text-base transition ${tone} ${chosen && !selected && !isRight ? "opacity-60" : ""}`}
              >
                <span aria-hidden className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border border-current font-mono text-xs uppercase">
                  {isRight ? "✓" : isWrong ? "✗" : o.id}
                </span>
                <span>
                  {o.label}
                  {isRight && <span className="sr-only"> (correct answer)</span>}
                  {isWrong && <span className="sr-only"> (your answer, not quite)</span>}
                </span>
              </button>
            );
          })}
        </div>

        <div aria-live="polite" className="mt-4 min-h-6">
          {chosen && (
            <div className="animate-rise rounded-xl border border-line bg-panel-2 p-4 text-sm">
              <p className="font-semibold">
                {question.kind === "knowledge"
                  ? wasCorrect
                    ? `Correct! +${XP_CORRECT} XP`
                    : "Not quite, and that is fine."
                  : `Noted! +${XP_PREFERENCE} XP`}
              </p>
              <p className="mt-1 text-muted">{question.explanation}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => setIndex(current - 1)} disabled={current === 0}>
          ← Previous
        </Button>
        <Button ref={nextRef} onClick={next} disabled={!chosen} className="min-w-40">
          {current === TOTAL - 1 ? "Finish" : "Next →"}
        </Button>
      </div>
    </section>
  );
}

function Completion(props: { xp: number; maxXp: number; correct: number; knowledgeTotal: number; onReview: () => void }) {
  return (
    <section aria-labelledby="done" className="animate-rise pt-8 text-center">
      <div className="animate-pop mx-auto grid size-32 place-items-center rounded-[2rem] border-2 border-brand bg-brand/10 shadow-[0_0_60px_-10px_rgb(34_211_103/0.5)]">
        <span aria-hidden className="text-6xl">🧭</span>
      </div>
      <p className="mt-5 font-mono text-sm uppercase tracking-widest text-brand">Badge unlocked</p>
      <h1 id="done" className="mt-1 text-4xl font-extrabold">Tech Explorer</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">You finished the challenge. Here is how you did, then your suggested tech lane.</p>
      <dl className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3">
        <div className="rounded-xl border border-line bg-panel p-4">
          <dt className="text-xs text-muted">XP earned</dt>
          <dd className="font-mono text-2xl font-bold text-brand">{props.xp}<span className="text-sm text-muted"> / {props.maxXp}</span></dd>
        </div>
        <div className="rounded-xl border border-line bg-panel p-4">
          <dt className="text-xs text-muted">Knowledge questions</dt>
          <dd className="font-mono text-2xl font-bold text-brand">{props.correct}<span className="text-sm text-muted"> / {props.knowledgeTotal}</span></dd>
        </div>
      </dl>
      <p className="mx-auto mt-3 max-w-sm text-xs text-muted">XP is just for fun. It is not a measure of your ability or career suitability.</p>
      <div className="mt-7 flex flex-col items-center gap-3">
        <ButtonLink href="/results" className="w-full max-w-sm text-lg">See my tech lane →</ButtonLink>
        <Button variant="ghost" onClick={props.onReview}>Review my answers</Button>
      </div>
    </section>
  );
}

