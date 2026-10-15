# Tech Lane Challenge: setup, deployment and event-day guide

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Zod · Google Sheets API (service account). The product spec is in [README.md](README.md).

## 1. Local development

```bash
npm install
cp .env.example .env.local     # fill in values (see section 2)
npm run dev                    # http://localhost:3000
```

The whole student journey (landing → challenge → results → track selection) works with **no credentials**. Submitting the consultation form without Sheets credentials returns an explicit "not set up" error. It never pretends to succeed and never writes to a mock destination.

| Command | Purpose |
| --- | --- |
| `npm test` | Unit/integration tests (Google API is mocked, no credentials needed) |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run build && npm start` | Production build and server |

Test the QR attribution locally with `http://localhost:3000/?src=booth` (`src` / `utm_source` and `campaign` / `utm_campaign` are validated, `[A-Za-z0-9_-]{1,50}`; campaign defaults to `GDG_NASHIK_DEVFEST_2026`).

## 2. Google Sheets configuration

1. **Create a Google Cloud project** → *APIs & Services → Library* → enable **Google Sheets API**.
2. *IAM & Admin → Service Accounts → Create*. No project roles are needed. Open it → *Keys → Add key → JSON*. Download the file and keep it **out of the repo**.
3. **Create the destination spreadsheet** (a dedicated one). Rename the first tab to `Leads` (or set `GOOGLE_SHEETS_SHEET_NAME`).
4. **Share the spreadsheet with the service account's `client_email` as *Editor*.** Do not make the sheet public or link-shared.
5. Paste this header row into row 1 of `Leads` (columns A–R):

   ```
   Lead ID	Created At	Name	Phone	Email	College / Organisation	Current Status	Recommended Track	Selected Track	Challenge Score	Consultation Format	Preferred Availability	Consultation Consent	Marketing Consent	Lead Source	Campaign	Lead Status	Follow-up Notes
   ```
   Staff edit **Lead Status** (New / Contacted / Scheduled / Completed / Closed) and **Follow-up Notes** directly in the sheet. The app only appends rows.
6. **Environment variables** (server-side only, never `NEXT_PUBLIC_`):

   | Variable | Value |
   | --- | --- |
   | `GOOGLE_SHEETS_SPREADSHEET_ID` | The ID in the sheet URL: `/spreadsheets/d/<ID>/edit` |
   | `GOOGLE_SHEETS_SHEET_NAME` | Tab name, default `Leads` |
   | `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64` | **Preferred.** `base64 -w0 service-account.json` (macOS: `base64 -i file \| tr -d '\n'`) |
   | `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_PRIVATE_KEY` | Alternative to the JSON. Literal `\n` sequences and wrapping quotes in the key are handled |
   | `ADMIN_EXPORT_TOKEN` | Random secret, 24+ chars: `openssl rand -base64 32`. Export is disabled without it |
   | `NEXT_PUBLIC_PRIVACY_CONTACT` | Optional. Shown on the form for correction/deletion requests (e.g. a team email) |
   | `NEXT_PUBLIC_SITE_URL` | Optional. Public URL for metadata |

Credential handling: the config and Sheets modules import `server-only`, so the build fails if client code ever imports them. `tests/security.test.ts` also checks this, plus that no secret-named `NEXT_PUBLIC_` variable exists.

## 3. Deploying (Vercel, HTTPS by default)

```bash
npm i -g vercel && vercel link
vercel env add GOOGLE_SHEETS_SPREADSHEET_ID production    # repeat for each variable above
vercel deploy --prod
```

Or import the repo in the Vercel dashboard and add the variables under *Settings → Environment Variables*. Then:

1. Open the production URL on a phone, play through, and submit a **test lead**. Confirm the row appears in the sheet, then delete that row.
2. Open `/admin/export`, enter the token, and confirm the CSV downloads.
3. Generate the QR code from `https://<your-domain>/?src=booth` (use different `src` values for brochure/stage QR codes to see which source converts). Scan it on one Android and one iOS device.

## 4. Staff CSV export

Open `https://<your-domain>/admin/export`, enter `ADMIN_EXPORT_TOKEN`, and click *Download CSV*. Scripted: `curl -H "Authorization: Bearer $TOKEN" https://<domain>/api/admin/export -o leads.csv`.

**Access-control decision (MVP):** a full admin login is out of scope, so the export is guarded by a long random bearer token. It travels in the `Authorization` header (never the URL), is compared in constant time, is rate-limited on failures, and the endpoint is `no-store`. Anyone holding the token can export all leads, so share it only with staff and rotate it afterwards (change the env var and redeploy). Cells are CSV-escaped, and any value starting with `= + - @` is prefixed with `'` to block formula injection (valid `+<digits>` phone numbers are left intact). Rows are always written to Sheets as raw text, never parsed as formulas.

## 5. How duplicate and failed submissions behave

- The browser creates one idempotency key per consultation request. The server derives the **Lead ID** from it (`L-` + hash), so retries and double-taps map to the same lead.
- Before every append the server looks for that Lead ID in the sheet. If a previous attempt wrote the row but its response was lost, it returns success **without** appending again. Only transient errors (network, 429, 5xx) are retried, 3 attempts with backoff. Permanent errors (403/404) fail immediately.
- If saving still fails the student sees a clear error, their form input is kept, and nothing is reported as submitted. Failures are logged by class only (no personal data).
- Anti-spam: honeypot field, per-IP limit (40 / 10 min, generous because venue Wi-Fi shares an IP), and max 3 *distinct* requests per phone number per hour.
- The recommended track and score stored with a lead are **recomputed on the server** from the answers, not trusted from the client.

## 6. Event-day troubleshooting

| Symptom | Likely cause → fix |
| --- | --- |
| Students see "Lead storage is not set up" | Env vars missing in the production environment. Add them and redeploy. Vercel logs show which names are missing |
| "We could not save your request" | Check Vercel logs for `[leads] save failed: permanent:403` → sheet not shared with the service account as Editor. `permanent:404` → wrong spreadsheet ID or tab name. `transient:429` → Sheets quota, students can retry. `transient` with no code → connectivity |
| `GOOGLE_PRIVATE_KEY is not a valid PEM` | Key pasted incorrectly. Use `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64` instead |
| Export says 503 | Token not set, or Sheets unreachable (same causes as above) |
| Export says 401 / 429 | Wrong token / too many wrong tries (wait 10 min) |
| Rows land in the wrong columns | Header row differs from section 2. Columns are positional (A–R) |
| Bad venue connectivity | Pages are light (system fonts, no images). Keep a backup QR/URL and a paper lead sheet as the PRD advises |
| A student says it failed but a row exists | Safe: retrying will not duplicate it (section 5) |

Funnel analytics are structured JSON log lines (`"type":"analytics"`) in the host's function logs, with only event name, track ids, source and XP; no personal data.

## 7. Known limitations (MVP)

- Rate limiting is per serverless instance (in memory). Use a shared store if you expect determined abuse.
- Idempotency reads the sheet on each submission, which is fine for hundreds of leads and gets slower beyond thousands.
- No retention job: delete leads from the sheet when no longer needed and publish a correction/deletion contact (`NEXT_PUBLIC_PRIVACY_CONTACT`).
- Brand green (`--color-brand` in `app/globals.css`) is a placeholder. Set DeboisTech's exact colour. No logo is bundled; a text wordmark is used.
- Not yet verified against a real Google Sheet (needs your credentials); see the checklist in section 3.
