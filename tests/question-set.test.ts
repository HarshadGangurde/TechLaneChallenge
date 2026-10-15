import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/lib/questions";
import { PREFERENCE_PER_RUN, primaryTrack, QUESTIONS_PER_RUN, questionsForAnswers, selectQuestions } from "@/lib/question-set";
import { recommend } from "@/lib/scoring";
import { TRACK_IDS, type Answers, type Question, type TrackId } from "@/types";

const seeds = Array.from({ length: 200 }, (_, i) => `seed-${i}`);

describe("question bank supports randomisation", () => {
  it("has at least two knowledge questions for every track", () => {
    for (const t of TRACK_IDS) {
      const n = QUESTIONS.filter((q) => q.kind === "knowledge" && primaryTrack(q) === t).length;
      expect(n, t).toBeGreaterThanOrEqual(2);
    }
  });
  it("has more preference questions than one run uses", () => {
    expect(QUESTIONS.filter((q) => q.kind === "preference").length).toBeGreaterThan(PREFERENCE_PER_RUN);
  });
});

describe("selectQuestions", () => {
  it("returns a fixed-size run of unique bank questions", () => {
    for (const seed of seeds) {
      const run = selectQuestions(seed);
      expect(run).toHaveLength(QUESTIONS_PER_RUN);
      expect(new Set(run.map((q) => q.id)).size).toBe(QUESTIONS_PER_RUN);
    }
  });
  it("is balanced: 4 preference, 6 knowledge covering every track, preference first", () => {
    for (const seed of seeds) {
      const run = selectQuestions(seed);
      expect(run[0].kind).toBe("preference");
      expect(run.filter((q) => q.kind === "preference")).toHaveLength(PREFERENCE_PER_RUN);
      const lanes = run.filter((q) => q.kind === "knowledge").map(primaryTrack);
      expect(new Set(lanes).size).toBe(TRACK_IDS.length);
    }
  });
  it("is deterministic per seed but varies across seeds", () => {
    expect(selectQuestions("abc")).toEqual(selectQuestions("abc"));
    const signatures = new Set(seeds.map((s) => selectQuestions(s).map((q) => q.id).join(",")));
    expect(signatures.size).toBeGreaterThan(20);
  });
  it("shuffles options without changing, losing or re-pointing them", () => {
    const run = selectQuestions("opts");
    for (const q of run) {
      const original = QUESTIONS.find((b) => b.id === q.id)!;
      expect([...q.options].sort((a, b) => a.id.localeCompare(b.id))).toEqual([...original.options].sort((a, b) => a.id.localeCompare(b.id)));
      expect(q.correctOptionId).toBe(original.correctOptionId);
    }
    const orders = new Set(seeds.map((s) => selectQuestions(s).flatMap((q) => q.options.map((o) => o.id)).join("")));
    expect(orders.size).toBeGreaterThan(20);
  });
  it("does not mutate the bank", () => {
    const before = JSON.stringify(QUESTIONS);
    selectQuestions("x");
    expect(JSON.stringify(QUESTIONS)).toBe(before);
  });
});

function answer(run: Question[], track: TrackId, knowledge: "correct" | "wrong"): Answers {
  const a: Answers = {};
  for (const q of run) {
    if (q.kind === "knowledge") {
      a[q.id] = knowledge === "correct" ? q.correctOptionId! : q.options.find((o) => o.id !== q.correctOptionId)!.id;
    } else {
      a[q.id] = q.options.reduce((best, o) => ((o.scores?.[track] ?? 0) > (best.scores?.[track] ?? 0) ? o : best)).id;
    }
  }
  return a;
}

describe("every random run can recommend every track", () => {
  for (const track of TRACK_IDS) {
    it(`recommends ${track} for answers favouring it (all seeds)`, () => {
      for (const seed of seeds) {
        const run = selectQuestions(seed);
        expect(recommend(answer(run, track, "wrong"), run).primary, seed).toBe(track);
        expect(recommend(answer(run, track, "correct"), run).primary, seed).toBe(track);
      }
    });
  }
});

describe("questionsForAnswers", () => {
  it("returns only the answered bank questions, so a run's max XP is computed on that run", () => {
    const run = selectQuestions("srv");
    const a = answer(run, "mobile", "correct");
    expect(questionsForAnswers({ ...a, "fake-id": "a" }).map((q) => q.id).sort()).toEqual(run.map((q) => q.id).sort());
    expect(recommend(a, questionsForAnswers(a)).score.maxXp).toBe(recommend(a, run).score.maxXp);
  });
});
