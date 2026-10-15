"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { IntroScreen } from "@/components/challenge/intro";
import { Button, ButtonLink } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { isCorrect, recommend, scoreAnswers, XP_CORRECT, XP_PREFERENCE } from "@/lib/scoring";
import { parseAnswers, session, useAnswersRaw, useQuestionSet } from "@/lib/session";
import type { Question } from "@/types";

export function Challenge() {
  const questions = useQuestionSet();
  const raw = useAnswersRaw();
  const [begun, setBegun] = useState(false);
  useEffect(() => {
    if (questions === null) session.ensureSeed();
  }, [questions]);
  if (!questions || raw === undefined) return <div className="mt-10 h-64 animate-pulse rounded-2xl bg-panel" aria-label="Loading challenge" />;
  // A fresh run starts with a short introduction; anyone resuming mid-challenge skips it.
  if (!begun && Object.keys(parseAnswers(raw)).length === 0) return <IntroScreen total={questions.length} onStart={() => setBegun(true)} />;
  return <ChallengeRun questions={questions} />;
}

function ChallengeRun({ questions }: { questions: Question[] }) {
  const TOTAL = questions.length;
  const raw = useAnswersRaw();
  const answers = useMemo(() => parseAnswers(raw), [raw]);
  const [index, setIndex] = useState<number | null>(null);
  const startedRef = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const focusNext = useRef(false);
  const mounted = useRef(false);

  const firstUnanswered = questions.findIndex((q) => !answers[q.id]);
  // Resume where the student left off, then stay put: the index must not follow
  // "first unanswered" or the screen would jump ahead as soon as an answer saves.
  if (index === null && raw !== undefined) setIndex(firstUnanswered === -1 ? TOTAL : firstUnanswered);
  const current = index ?? 0;
  const { xp, maxXp, correct, knowledgeTotal } = useMemo(() => scoreAnswers(answers, questions), [answers, questions]);

  useEffect(() => {
    if (raw !== undefined && !startedRef.current && Object.keys(answers).length === 0) {
      startedRef.current = true;
      track("challenge_started", { source: session.getSource() });
    }
  }, [raw, answers]);

  const question = questions[current];
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
    const rec = recommend(answers, questions);
    track("challenge_completed", { xp: rec.score.xp, source: session.getSource() });
    track("track_recommended", { recommended_track: rec.primary, source: session.getSource() });
    setIndex(TOTAL);
  }

  if (!question) {
    return <Completion xp={xp} maxXp={maxXp} correct={correct} knowledgeTotal={knowledgeTotal} onReview={() => setIndex(TOTAL - 1)} />;
  }

  const answeredCount = questions.filter((q) => answers[q.id]).length;
  const wasCorrect = chosen ? isCorrect(question, chosen) : false;
  const gain = chosen ? (question.kind === "knowledge" ? (wasCorrect ? XP_CORRECT : 0) : XP_PREFERENCE) : 0;

  return (
    <section aria-labelledby="q-heading" className="pt-2">
      <div className="flex items-center justify-between gap-3">
        <span aria-live="polite" className="nb-shadow-sm rounded-full border-2 border-ink bg-white px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider">
          Question {current + 1} of {TOTAL}
        </span>
        <span className="nb-shadow-sm relative rounded-full border-2 border-ink bg-brand px-3 py-1 font-mono text-sm font-bold text-white" aria-label={`${xp} XP earned`}>
          {xp} XP
          {chosen && gain > 0 && (
            <span key={question.id} aria-hidden className="animate-float-xp absolute -top-2 right-2 text-xs font-extrabold">+{gain}</span>
          )}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={TOTAL}
        aria-valuenow={answeredCount}
        aria-label="Challenge progress"
        className="relative mt-4 h-10"
      >
        <div aria-hidden className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-ink/30" />
        <div aria-hidden className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full border-2 border-ink bg-brand transition-[width] duration-500" style={{ width: `calc((100% - 3.4rem) * ${answeredCount / TOTAL} + 1.7rem)` }} />
        <Image
          src="/logo.png"
          alt=""
          width={54}
          height={32}
          aria-hidden
          className="absolute top-0.5 h-9 w-auto transition-[left] duration-500"
          style={{ left: `calc((100% - 3.4rem) * ${answeredCount / TOTAL})` }}
        />
        <span aria-hidden className="absolute right-0 top-1/2 -translate-y-1/2 text-xl">🏁</span>
      </div>

      <div key={question.id} className="animate-rise mt-6">
        <p className="inline-block rounded-full border-2 border-ink bg-lane-sun px-3 py-0.5 font-mono text-xs font-bold uppercase tracking-widest">{question.emoji && <span aria-hidden>{question.emoji} </span>}{question.category}</p>
        <h1 id="q-heading" ref={headingRef} tabIndex={-1} className="mt-3 font-display text-2xl font-extrabold leading-snug outline-none sm:text-3xl">
          {question.prompt}
        </h1>
        {question.snippet && (
          <pre className="mt-4 overflow-x-auto rounded-xl border-2 border-ink bg-ink p-4 font-mono text-sm leading-relaxed text-paper shadow-[3px_3px_0_0_#2c8441]"><code>{question.snippet}</code></pre>
        )}

        <div role="group" aria-label="Answer options" className="mt-5 grid gap-3">
          {question.options.map((o, i) => {
            const selected = chosen === o.id;
            const reveal = !!chosen && question.kind === "knowledge";
            const isRight = reveal && o.id === question.correctOptionId;
            const isWrong = reveal && selected && !isRight;
            const tone = isRight
              ? "border-ink bg-[#bfe5c8] shadow-[3px_3px_0_0_#14110f]"
              : isWrong
                ? "border-danger bg-lane-pink shadow-[3px_3px_0_0_#c0281f]"
                : selected
                  ? "border-ink bg-brand/25 shadow-[3px_3px_0_0_#14110f]"
                  : "border-ink bg-white shadow-[3px_3px_0_0_#14110f] hover:-translate-y-0.5 hover:bg-panel-2";
            return (
              <button
                key={o.id}
                type="button"
                aria-pressed={selected}
                aria-disabled={!!chosen}
                onClick={() => pick(o.id)}
                className={`flex min-h-14 w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left text-base font-medium transition ${tone} ${chosen && !selected && !isRight ? "opacity-60 shadow-none" : ""}`}
              >
                <span aria-hidden className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border-2 border-ink bg-white font-mono text-xs font-bold uppercase">
                  {isRight ? "✓" : isWrong ? "✗" : String.fromCharCode(97 + i)}
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
            <div className={`animate-rise nb-card p-4 text-sm ${question.kind === "knowledge" && wasCorrect ? "bg-lane-green" : "bg-lane-sun"}`}>
              <p className="font-semibold">
                {question.kind === "knowledge"
                  ? wasCorrect
                    ? `Correct! +${XP_CORRECT} XP`
                    : "Not quite, and that is fine."
                  : `Noted! +${XP_PREFERENCE} XP`}
              </p>
              <p className="mt-1 text-[#3e3730]">{question.explanation}</p>
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
      <div className="animate-pop nb-shadow mx-auto grid size-32 -rotate-3 place-items-center rounded-[2rem] border-2 border-ink bg-lane-sun">
        <span aria-hidden className="text-6xl">🧭</span>
      </div>
      <p className="mt-5 font-mono text-sm uppercase tracking-widest text-brand-strong">Badge unlocked</p>
      <h1 id="done" className="mt-1 font-display text-5xl font-extrabold">Tech Explorer</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">You finished the challenge. Here is how you did, then your suggested tech lane.</p>
      <dl className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3">
        <div className="nb-card p-4">
          <dt className="text-xs text-muted">XP earned</dt>
          <dd className="font-mono text-2xl font-bold text-brand-strong">{props.xp}<span className="text-sm text-muted"> / {props.maxXp}</span></dd>
        </div>
        <div className="nb-card p-4">
          <dt className="text-xs text-muted">Knowledge questions</dt>
          <dd className="font-mono text-2xl font-bold text-brand-strong">{props.correct}<span className="text-sm text-muted"> / {props.knowledgeTotal}</span></dd>
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

