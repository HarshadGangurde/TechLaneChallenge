import { describe, expect, it } from "vitest";
import { ROADMAPS } from "@/lib/roadmaps";
import { TRACK_IDS } from "@/types";

describe("roadmaps", () => {
  it("has a four-stage roadmap with topics and a milestone for every track", () => {
    for (const id of TRACK_IDS) {
      const stages = ROADMAPS[id];
      expect(stages, id).toHaveLength(4);
      for (const s of stages) {
        expect(s.title.length).toBeGreaterThan(2);
        expect(s.pace).toMatch(/^Weeks? \d/);
        expect(s.topics.length).toBeGreaterThanOrEqual(2);
        expect(s.milestone.length).toBeGreaterThan(20);
      }
    }
  });
  it("fits every roadmap into eight weeks, in four consecutive two-week stages", () => {
    for (const id of TRACK_IDS) {
      const ranges = ROADMAPS[id].map((s) => {
        const m = /^Weeks (\d+)–(\d+)$/.exec(s.pace);
        expect(m, `${id} ${s.pace}`).not.toBeNull();
        return [Number(m![1]), Number(m![2])];
      });
      expect(ranges, id).toEqual([[1, 2], [3, 4], [5, 6], [7, 8]]);
    }
  });
  it("avoids fees, placement and guarantee claims", () => {
    const text = JSON.stringify(ROADMAPS).toLowerCase();
    expect(text).not.toContain("₹");
    for (const word of ["fee", "fees", "price", "prices", "placement", "placements", "guarantee", "guaranteed", "salary"]) {
      expect(text, word).not.toMatch(new RegExp(`\\b${word}\\b`));
    }
  });
});
