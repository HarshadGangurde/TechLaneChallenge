/** Number of lead columns the app writes (A–R in a plain sheet). Kept in sync with SHEET_HEADERS by a test. */
export const LEAD_COLUMN_COUNT = 18;

const START_CELL = /^([A-Z]{1,2})([1-9][0-9]{0,5})$/;

export function columnToIndex(letters: string): number {
  return [...letters].reduce((n, ch) => n * 26 + (ch.charCodeAt(0) - 64), 0);
}

export function indexToColumn(index: number): string {
  let n = index;
  let out = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

/**
 * The A1 range of the leads table, from its header cell down: e.g. start "B8"
 * and 18 columns gives "B8:S". Lets the table live below a title/dashboard.
 */
export function tableRange(startCell: string, columnCount: number = LEAD_COLUMN_COUNT): string {
  const m = START_CELL.exec(startCell.trim().toUpperCase());
  if (!m) throw new Error(`Invalid table start cell "${startCell}". Use a cell like A1 or B8.`);
  const endColumn = indexToColumn(columnToIndex(m[1]) + columnCount - 1);
  return `${m[1]}${m[2]}:${endColumn}`;
}
