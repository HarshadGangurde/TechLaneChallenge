import "server-only";
import { JWT } from "google-auth-library";
import { getSheetsConfig, type SheetsConfig } from "@/lib/config";

/** Minimal surface the app needs from Sheets; tests inject a fake. */
export interface SheetsGateway {
  appendRow(values: string[]): Promise<void>;
  /** All rows including the header row (if any). */
  readRows(): Promise<string[][]>;
}

export type StorageErrorKind = "config" | "transient" | "permanent";

export class StorageError extends Error {
  constructor(
    message: string,
    readonly kind: StorageErrorKind,
    readonly status?: number,
  ) {
    super(message);
    this.name = "StorageError";
  }
}

const SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const API = "https://sheets.googleapis.com/v4/spreadsheets";

function toStorageError(err: unknown): StorageError {
  if (err instanceof StorageError) return err;
  const e = err as { response?: { status?: number }; status?: number; code?: string | number; message?: string };
  const status = e.response?.status ?? e.status ?? (typeof e.code === "number" ? e.code : undefined);
  // Network faults, timeouts, rate limits and 5xx are worth retrying.
  const transient =
    status === undefined || status === 408 || status === 429 || status >= 500 || typeof e.code === "string";
  // Never include the upstream message verbatim: it can echo request details.
  return new StorageError(
    `Google Sheets request failed${status ? ` (HTTP ${status})` : ""}`,
    transient ? "transient" : "permanent",
    status,
  );
}

export function createSheetsGateway(config: SheetsConfig = getSheetsConfig()): SheetsGateway {
  const client = new JWT({ email: config.clientEmail, key: config.privateKey, scopes: [SCOPE] });
  const range = encodeURIComponent(`'${config.sheetName.replace(/'/g, "''")}'!${config.tableRange}`);
  const base = `${API}/${encodeURIComponent(config.spreadsheetId)}/values`;

  return {
    async appendRow(values) {
      try {
        await client.request({
          url: `${base}/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
          method: "POST",
          data: { values: [values] },
          timeout: 10_000,
        });
      } catch (err) {
        throw toStorageError(err);
      }
    },
    async readRows() {
      try {
        const res = await client.request<{ values?: string[][] }>({
          url: `${base}/${range}?majorDimension=ROWS`,
          timeout: 10_000,
        });
        return res.data.values ?? [];
      } catch (err) {
        throw toStorageError(err);
      }
    },
  };
}
