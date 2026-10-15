import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ConfigError, getAdminToken, getSheetsConfig, normalizePrivateKey } from "@/lib/config";
import { createRateLimiter } from "@/lib/rate-limit";
import { sanitizeProps } from "@/lib/analytics";
import { tokenMatches } from "@/app/api/admin/export/route";

const root = path.resolve(__dirname, "..");
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    if (["node_modules", ".next", "tests"].includes(f)) return [];
    return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx)$/.test(p) ? [p] : [];
  });
}

describe("credential protection", () => {
  const files = walk(root).map((p) => ({ p, src: readFileSync(p, "utf8") }));

  it("never imports server-only modules from client components", () => {
    const clients = files.filter((f) => /^\s*["']use client["']/.test(f.src));
    expect(clients.length).toBeGreaterThan(0);
    for (const f of clients) {
      expect(f.src, f.p).not.toMatch(/lib\/(config|google-sheets|lead-storage)["']/);
    }
  });

  it("marks credential modules server-only", () => {
    for (const name of ["config", "google-sheets", "lead-storage"]) {
      expect(readFileSync(path.join(root, "lib", `${name}.ts`), "utf8")).toContain('import "server-only"');
    }
  });

  it("never exposes secrets through NEXT_PUBLIC_ variables", () => {
    const publicVars = new Set(files.flatMap((f) => [...f.src.matchAll(/NEXT_PUBLIC_[A-Z0-9_]+/g)].map((m) => m[0])));
    for (const v of publicVars) expect(v).not.toMatch(/KEY|SECRET|TOKEN|PRIVATE|GOOGLE|ADMIN/);
    expect(readFileSync(path.join(root, ".env.example"), "utf8")).not.toMatch(/NEXT_PUBLIC_(GOOGLE|ADMIN)/);
  });

  it("has no private key material in the repo", () => {
    for (const f of files) expect(f.src, f.p).not.toMatch(/BEGIN PRIVATE KEY-----(\\n|\s)*[A-Za-z0-9+\/]{40,}/);
  });
});

describe("sheets configuration", () => {
  const key = "-----BEGIN PRIVATE KEY-----\\nABC\\n-----END PRIVATE KEY-----\\n";
  it("fails explicitly, naming missing vars but no values", () => {
    expect(() => getSheetsConfig({} as NodeJS.ProcessEnv)).toThrow(ConfigError);
    try {
      getSheetsConfig({ GOOGLE_PRIVATE_KEY: key } as unknown as NodeJS.ProcessEnv);
    } catch (e) {
      expect((e as Error).message).toContain("GOOGLE_SHEETS_SPREADSHEET_ID");
      expect((e as Error).message).not.toContain("ABC");
    }
  });
  it("handles escaped newlines and wrapping quotes", () => {
    expect(normalizePrivateKey(`"${key}"`)).toContain("\n");
    expect(normalizePrivateKey(`"${key}"`).startsWith("-----BEGIN")).toBe(true);
  });
  it("reads base64 service-account JSON", () => {
    const json = Buffer.from(JSON.stringify({ client_email: "sa@x.iam.gserviceaccount.com", private_key: key })).toString("base64");
    const c = getSheetsConfig({ GOOGLE_SHEETS_SPREADSHEET_ID: "sheet", GOOGLE_SERVICE_ACCOUNT_JSON_BASE64: json } as unknown as NodeJS.ProcessEnv);
    expect(c.clientEmail).toBe("sa@x.iam.gserviceaccount.com");
    expect(c.sheetName).toBe("Leads");
    expect(c.privateKey).toContain("\n");
  });
  it("rejects malformed base64 JSON", () => {
    expect(() => getSheetsConfig({ GOOGLE_SERVICE_ACCOUNT_JSON_BASE64: "###" } as unknown as NodeJS.ProcessEnv)).toThrow(ConfigError);
  });
});

describe("admin export access control", () => {
  it("disables export for missing or weak tokens", () => {
    expect(getAdminToken({} as NodeJS.ProcessEnv)).toBeNull();
    expect(getAdminToken({ ADMIN_EXPORT_TOKEN: "short" } as unknown as NodeJS.ProcessEnv)).toBeNull();
    expect(getAdminToken({ ADMIN_EXPORT_TOKEN: "x".repeat(24) } as unknown as NodeJS.ProcessEnv)).toBe("x".repeat(24));
  });
  it("compares tokens exactly", () => {
    expect(tokenMatches("a".repeat(24), "a".repeat(24))).toBe(true);
    expect(tokenMatches("a".repeat(23) + "b", "a".repeat(24))).toBe(false);
    expect(tokenMatches("", "a".repeat(24))).toBe(false);
  });
});

describe("rate limiter", () => {
  it("blocks after the limit and recovers after the window", () => {
    const rl = createRateLimiter(2, 1000);
    expect(rl.check("ip", 0).allowed).toBe(true);
    expect(rl.check("ip", 1).allowed).toBe(true);
    expect(rl.check("ip", 2).allowed).toBe(false);
    expect(rl.check("other", 2).allowed).toBe(true);
    expect(rl.check("ip", 1001).allowed).toBe(true);
  });
});

describe("analytics privacy", () => {
  it("drops personal or unexpected properties", () => {
    const p = sanitizeProps({ name: "Asha", phone: "+919876543210", email: "a@b.co", track: "mobile", xp: 80, source: "a b c" });
    expect(p).toEqual({ track: "mobile", xp: 80 });
  });
});
