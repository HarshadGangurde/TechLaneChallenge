import { describe, expect, it } from "vitest";
import { SHEET_HEADERS } from "@/lib/lead-storage";
import { columnToIndex, indexToColumn, LEAD_COLUMN_COUNT, tableRange } from "@/lib/sheet-range";

describe("sheet range helpers", () => {
  it("column count matches the header list", () => {
    expect(LEAD_COLUMN_COUNT).toBe(SHEET_HEADERS.length);
  });
  it("converts columns both ways", () => {
    expect(columnToIndex("A")).toBe(1);
    expect(columnToIndex("Z")).toBe(26);
    expect(columnToIndex("AA")).toBe(27);
    expect(indexToColumn(18)).toBe("R");
    expect(indexToColumn(27)).toBe("AA");
    expect(indexToColumn(columnToIndex("AZ"))).toBe("AZ");
  });
  it("builds the table range from the start cell", () => {
    expect(tableRange("A1")).toBe("A1:R");
    expect(tableRange("B8")).toBe("B8:S");
    expect(tableRange(" b8 ")).toBe("B8:S");
    expect(tableRange("Z2")).toBe("Z2:AQ");
  });
  it("rejects invalid start cells", () => {
    for (const bad of ["", "8B", "B0", "B", "1", "B8:S", "'; DROP"]) expect(() => tableRange(bad), bad).toThrow();
  });
});
