import "server-only";
import { tableRange } from "@/lib/sheet-range";

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export interface SheetsConfig {
  spreadsheetId: string;
  sheetName: string;
  /** A1 range of the leads table from its header row down, e.g. "A1:R" or "B8:S". */
  tableRange: string;
  clientEmail: string;
  privateKey: string;
}

/** Turn an env-var private key into real PEM text (handles "\n" escapes and wrapping quotes). */
export function normalizePrivateKey(raw: string): string {
  return raw.trim().replace(/^["']|["']$/g, "").replace(/\\n/g, "\n");
}

/**
 * Read Google Sheets settings from the environment. Prefers the base64
 * service-account JSON; falls back to email + private key. Error messages name
 * the missing variables but never include secret values.
 */
export function getSheetsConfig(env: NodeJS.ProcessEnv = process.env): SheetsConfig {
  const spreadsheetId = env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();
  const sheetName = env.GOOGLE_SHEETS_SHEET_NAME?.trim() || "Leads";

  let range: string;
  try {
    range = tableRange(env.GOOGLE_SHEETS_TABLE_START?.trim() || "A1");
  } catch (err) {
    throw new ConfigError(`GOOGLE_SHEETS_TABLE_START: ${err instanceof Error ? err.message : "invalid"}`);
  }

  let clientEmail = env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  let privateKey = env.GOOGLE_PRIVATE_KEY ? normalizePrivateKey(env.GOOGLE_PRIVATE_KEY) : undefined;

  const b64 = env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64?.trim();
  if (b64) {
    try {
      const json = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
      clientEmail = json.client_email;
      privateKey = json.private_key ? normalizePrivateKey(json.private_key) : undefined;
    } catch {
      throw new ConfigError("GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 is not valid base64-encoded JSON.");
    }
  }

  const missing: string[] = [];
  if (!spreadsheetId) missing.push("GOOGLE_SHEETS_SPREADSHEET_ID");
  if (!clientEmail) missing.push("GOOGLE_SERVICE_ACCOUNT_EMAIL (or GOOGLE_SERVICE_ACCOUNT_JSON_BASE64)");
  if (!privateKey) missing.push("GOOGLE_PRIVATE_KEY (or GOOGLE_SERVICE_ACCOUNT_JSON_BASE64)");
  if (missing.length) throw new ConfigError(`Google Sheets is not configured. Missing: ${missing.join(", ")}`);
  if (!privateKey!.includes("BEGIN PRIVATE KEY")) {
    throw new ConfigError("GOOGLE_PRIVATE_KEY is not a valid PEM private key.");
  }

  return { spreadsheetId: spreadsheetId!, sheetName, tableRange: range, clientEmail: clientEmail!, privateKey: privateKey! };
}

export function getAdminToken(env: NodeJS.ProcessEnv = process.env): string | null {
  const t = env.ADMIN_EXPORT_TOKEN?.trim();
  return t && t.length >= 24 ? t : null;
}
