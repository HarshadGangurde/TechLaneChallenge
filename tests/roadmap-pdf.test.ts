import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { buildRoadmapPdf } from "@/lib/roadmap-pdf";
import { TRACK_IDS } from "@/types";

describe("roadmap PDF", () => {
  for (const id of TRACK_IDS) {
    it(`builds a valid, short PDF for ${id}`, async () => {
      const bytes = await buildRoadmapPdf(id);
      expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe("%PDF-");
      const doc = await PDFDocument.load(bytes);
      expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
      expect(doc.getPageCount()).toBeLessThanOrEqual(3);
      expect(doc.getTitle()).toContain("DeboisTech");
    });
  }
});
