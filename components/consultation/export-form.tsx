"use client";

import { useState } from "react";
import { Button, Spinner } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";

/** Staff-only. The token is sent in a header and kept only in memory, never in the URL. */
export function ExportForm() {
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/export", { headers: { Authorization: `Bearer ${token.trim()}` }, cache: "no-store" });
      if (!res.ok) {
        const msg = res.status === 401 ? "Wrong token." : res.status === 429 ? "Too many attempts. Wait a few minutes." : ((await res.json().catch(() => null)) as { error?: string } | null)?.error ?? "Export failed.";
        throw new Error(msg);
      }
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = res.headers.get("content-disposition")?.match(/filename="([^"]+)"/)?.[1] ?? "leads.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="pt-6">
      <h1 className="text-3xl font-extrabold">Staff lead export</h1>
      <p className="mt-2 text-muted">Download all leads as CSV. Contains personal data, so handle it carefully and delete local copies when done.</p>
      <form onSubmit={download} className="mt-6 space-y-4">
        <Field id="token" label="Export token" required error={error ?? undefined}>
          {(p) => <input {...p} className={inputClass} type="password" autoComplete="off" value={token} onChange={(e) => setToken(e.target.value)} />}
        </Field>
        <Button type="submit" disabled={busy || token.trim().length < 8}>{busy ? <><Spinner /> Preparing…</> : "Download CSV"}</Button>
      </form>
    </section>
  );
}
