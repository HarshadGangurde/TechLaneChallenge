import { describe, expect, it } from "vitest";
import { escapeCsvCell, neutraliseFormula, toCsv } from "@/lib/csv";

describe("CSV escaping", () => {
  it("quotes commas, quotes and newlines", () => {
    expect(escapeCsvCell("a,b")).toBe('"a,b"');
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvCell("line1\nline2")).toBe('"line1\nline2"');
    expect(escapeCsvCell("cr\rhere")).toBe('"cr\rhere"');
  });
  it("renders null/undefined as empty", () => {
    expect(escapeCsvCell(null)).toBe("");
    expect(escapeCsvCell(undefined)).toBe("");
  });
  it("leaves plain text alone", () => {
    expect(escapeCsvCell("Asha Patil")).toBe("Asha Patil");
  });
});

describe("formula injection", () => {
  it.each(["=SUM(A1)", "+1+1", "-2+3", "@cmd", "\t=1", '=HYPERLINK("http://evil","x")'])("neutralises %j", (v) => {
    expect(neutraliseFormula(v).startsWith("'")).toBe(true);
  });
  it("keeps valid E.164 phone numbers intact", () => {
    expect(neutraliseFormula("+919876543210")).toBe("+919876543210");
  });
  it("does not treat phone-like formulas as phones", () => {
    expect(neutraliseFormula("+91+1")).toBe("'+91+1");
  });
  it("neutralises before quoting", () => {
    expect(escapeCsvCell('=1,"x"')).toBe(`"'=1,""x"""`);
  });
});

describe("toCsv", () => {
  it("writes a header row and CRLF line endings", () => {
    expect(toCsv(["A", "B"], [["1", "x,y"]])).toBe('A,B\r\n1,"x,y"\r\n');
  });
});
