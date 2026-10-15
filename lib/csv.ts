/**
 * CSV serialisation for lead exports.
 * - Quotes cells containing commas, quotes or line breaks (RFC 4180).
 * - Neutralises spreadsheet formula injection: any cell that Excel/Sheets could
 *   evaluate (starts with = + - @, tab or CR) is prefixed with an apostrophe.
 *   A strict E.164 phone number is the one deliberate exception.
 */
const FORMULA_START = /^[=+\-@\t\r]/;
const SAFE_PHONE = /^\+[0-9]{7,15}$/;

export function neutraliseFormula(value: string): string {
  if (SAFE_PHONE.test(value)) return value;
  return FORMULA_START.test(value) ? `'${value}` : value;
}

export function escapeCsvCell(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  const safe = neutraliseFormula(str);
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toCsv(headers: readonly string[], rows: readonly (readonly unknown[])[]): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(","));
  return lines.join("\r\n") + "\r\n";
}
