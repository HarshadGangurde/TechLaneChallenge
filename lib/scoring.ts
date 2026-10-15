import { QUESTIONS } from "@/lib/questions";
import {
  TRACK_IDS,
  type Answers,
  type Question,
  type Recommendation,
  type ScoreResult,
  type TrackId,
  type TrackScores,
} from "@/types";

/** XP awarded for a correct knowledge answer / for answering a preference question. */
export const XP_CORRECT = 10;
export const XP_PREFERENCE = 5;
/** A runner-up within this many points of the leader is shown as a second option. */
export const CLOSE_MARGIN = 2;

export function emptyScores(): TrackScores {
  return Object.fromEntries(TRACK_IDS.map((id) => [id, 0])) as TrackScores;
}

export function maxXp(questions: Question[] = QUESTIONS): number {
  return questions.reduce((sum, q) => sum + (q.kind === "knowledge" ? XP_CORRECT : XP_PREFERENCE), 0);
}

export function isCorrect(question: Question, optionId: string | undefined): boolean {
  return question.kind === "knowledge" && !!optionId && optionId === question.correctOptionId;
}

/**
 * XP and track points a single answer is worth. Pure and idempotent: the same
 * (question, option) pair always yields the same result.
 */
export function scoreAnswer(question: Question, optionId: string | undefined) {
  const option = question.options.find((o) => o.id === optionId);
  const points = emptyScores();
  let xp = 0;
  if (!option) return { xp, points, interest: emptyScores() };

  if (question.kind === "knowledge") {
    if (isCorrect(question, option.id)) {
      xp = XP_CORRECT;
      for (const [track, pts] of Object.entries(question.tracksOnCorrect ?? {})) {
        points[track as TrackId] += pts ?? 0;
      }
    }
    return { xp, points, interest: emptyScores() };
  }

  xp = XP_PREFERENCE;
  const interest = emptyScores();
  for (const [track, pts] of Object.entries(option.scores ?? {})) {
    points[track as TrackId] += pts ?? 0;
    interest[track as TrackId] += pts ?? 0;
  }
  return { xp, points, interest };
}

/**
 * Score a full answer map. Iterates the question bank (one answer per
 * question), so duplicate or unknown ids in `answers` can never inflate scores.
 */
export function scoreAnswers(answers: Answers, questions: Question[] = QUESTIONS): ScoreResult {
  const trackScores = emptyScores();
  const interestScores = emptyScores();
  let xp = 0;
  let correct = 0;
  let knowledgeTotal = 0;

  for (const q of questions) {
    if (q.kind === "knowledge") knowledgeTotal += 1;
    const r = scoreAnswer(q, answers[q.id]);
    xp += r.xp;
    if (isCorrect(q, answers[q.id])) correct += 1;
    for (const id of TRACK_IDS) {
      trackScores[id] += r.points[id];
      interestScores[id] += r.interest[id];
    }
  }
  return { trackScores, interestScores, xp, maxXp: maxXp(questions), correct, knowledgeTotal };
}

/**
 * Rank tracks: total score, then interest-only score, then catalogue order,
 * so results are fully deterministic.
 */
export function rankTracks(result: Pick<ScoreResult, "trackScores" | "interestScores">): TrackId[] {
  return [...TRACK_IDS].sort(
    (a, b) =>
      result.trackScores[b] - result.trackScores[a] ||
      result.interestScores[b] - result.interestScores[a] ||
      TRACK_IDS.indexOf(a) - TRACK_IDS.indexOf(b),
  );
}

export function recommend(
  answers: Answers,
  questions: Question[] = QUESTIONS,
): Recommendation & { score: ScoreResult } {
  const score = scoreAnswers(answers, questions);
  const ranking = rankTracks(score);
  const [primary, runnerUp] = ranking;
  const gap = score.trackScores[primary] - score.trackScores[runnerUp];
  const secondary = score.trackScores[runnerUp] > 0 && gap <= CLOSE_MARGIN ? runnerUp : null;

  const reasons = questions
    .filter((q) => scoreAnswer(q, answers[q.id]).points[primary] > 0)
    .map((q) => q.id);

  return { primary, secondary, scores: score.trackScores, ranking, reasons, score };
}
