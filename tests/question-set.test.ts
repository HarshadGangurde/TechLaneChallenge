import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/lib/questions";
import { optionTrack, PREFERENCE_OPTIONS, PREFERENCE_PER_RUN, primaryTrack, QUESTIONS_PER_RUN, questionsForAnswers, selectQuestions } from "@/lib/question-set";
import { recommend } from "@/lib/scoring";
import { TRACK_IDS, type Answers } from "@/types";

const seeds = Array.from({ length: 200 }, (_, i) => `seed-${i}`);

describe("question bank supports randomisation", () => {
  it("has at least six knowledge questions for every track", () => {
    for (const t of TRACK_IDS) {
      const n = QUESTIONS.filter((q) => q.kind === "knowledge" && primaryTrack(q) === t).length;
      expect(n, t).toBeGreaterThanOrEqual(6);
    }
  });
  it("has at least 16 preference questions, well above what one run uses", () => {
    expect(QUESTIONS.filter((q) => q.kind === "preference").length).toBeGreaterThanOrEqual(16);
    expect(QUESTIONS.filter((q) => q.kind === "preference").length).toBeGreaterThan(PREFERENCE_PER_RUN * 3);
  });
  it("uses the whole bank across 600 students, with little overlap between two students", () => {
    const sets = Array.from({ length: 600 }, (_, i) => selectQuestions(`student-${i}`).map((q) => q.id));
    expect(new Set(sets.flat()).size).toBe(QUESTIONS.length);
    let overlap = 0;
    for (let i = 0; i < 599; i++) overlap += sets[i].filter((id) => sets[i + 1].includes(id)).length;
    expect(overlap / 599).toBeLessThan(2.5); // avg shared questions between two students out of 10
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
      // Every shown option is an untouched original; knowledge questions keep all of theirs.
      for (const o of q.options) expect(original.options).toContainEqual(o);
      expect(q.options.length).toBe(q.kind === "knowledge" ? original.options.length : PREFERENCE_OPTIONS);
      expect(new Set(q.options.map((o) => o.id)).size).toBe(q.options.length);
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

describe("preference questions show four options without sidelining any track", () => {
  it("has one option per track in every bank preference question", () => {
    for (const q of QUESTIONS.filter((x) => x.kind === "preference")) {
      expect(q.options.length, q.id).toBe(TRACK_IDS.length);
      expect(new Set(q.options.map(optionTrack)).size, q.id).toBe(TRACK_IDS.length);
    }
  });
  it("shows exactly four options per preference question in every run", () => {
    for (const seed of seeds) {
      for (const q of selectQuestions(seed).filter((x) => x.kind === "preference")) {
        expect(q.options, `${seed} ${q.id}`).toHaveLength(PREFERENCE_OPTIONS);
      }
    }
  });
  it("keeps every track on offer in at least two of the four preference questions", () => {
    for (const seed of seeds) {
      const prefs = selectQuestions(seed).filter((x) => x.kind === "preference");
      for (const t of TRACK_IDS) {
        const shown = prefs.filter((q) => q.options.some((o) => optionTrack(o) === t)).length;
        expect(shown, `${seed} ${t}`).toBeGreaterThanOrEqual(2);
      }
    }
  });
  it("still lets a student who picks a track whenever it is offered reach that track's top score", () => {
    for (const track of TRACK_IDS) {
      for (const seed of seeds) {
        const run = selectQuestions(seed);
        const a: Answers = {};
        for (const q of run) {
          if (q.kind === "knowledge") a[q.id] = q.options.find((o) => o.id !== q.correctOptionId)!.id;
          else a[q.id] = (q.options.find((o) => optionTrack(o) === track) ?? q.options[0]).id;
        }
        const rec = recommend(a, run);
        expect(rec.scores[track], `${seed} ${track}`).toBeGreaterThanOrEqual(2 * 2); // offered in >=2 questions, >=2 points each
      }
    }
  });
});

describe("questionsForAnswers", () => {
  it("returns only the answered bank questions, so a run's max XP is computed on that run", () => {
    const run = selectQuestions("srv");
    const a: Answers = Object.fromEntries(run.map((q) => [q.id, q.options[0].id]));
    expect(questionsForAnswers({ ...a, "fake-id": "a" }).map((q) => q.id).sort()).toEqual(run.map((q) => q.id).sort());
    expect(recommend(a, questionsForAnswers(a)).score.maxXp).toBe(recommend(a, run).score.maxXp);
  });
});
