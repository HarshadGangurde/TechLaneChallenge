import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import { COMPANY, CONTACT } from "@/lib/constants";
import { ROADMAPS } from "@/lib/roadmaps";
import { getTrack } from "@/lib/tracks";
import type { TrackId } from "@/types";

const W = 595.28; // A4
const H = 841.89;
const M = 40;
const CW = W - 2 * M;

const C = {
  paper: rgb(0.984, 0.969, 0.937),
  ink: rgb(0.078, 0.067, 0.059),
  brand: rgb(0.173, 0.518, 0.255),
  brandStrong: rgb(0.122, 0.435, 0.208),
  sun: rgb(1, 0.941, 0.761),
  white: rgb(1, 1, 1),
  muted: rgb(0.431, 0.396, 0.349),
  body: rgb(0.243, 0.216, 0.188),
};

/** The built-in PDF fonts only cover Latin-1 text, so map or drop anything else. */
function safe(s: string): string {
  return s
    .replace(/→/g, "›")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\x20-\x7E -ÿ–—•›]/g, "");
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = safe(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) line = next;
    else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function asset(name: string): Promise<Uint8Array> {
  return readFile(path.join(process.cwd(), "public", name));
}

/** A shadowed, outlined "sticker" box, matching the app's look. */
function box(page: PDFPage, x: number, yTop: number, w: number, h: number, fill = C.white, dashed = false) {
  if (!dashed) page.drawRectangle({ x: x + 3, y: yTop - h - 3, width: w, height: h, color: C.ink });
  page.drawRectangle({
    x,
    y: yTop - h,
    width: w,
    height: h,
    color: fill,
    borderColor: C.ink,
    borderWidth: dashed ? 1 : 1.5,
    ...(dashed ? { borderDashArray: [4, 3], borderOpacity: 0.55 } : {}),
  });
}

export async function buildRoadmapPdf(id: TrackId): Promise<Uint8Array> {
  const track = getTrack(id);
  const stages = ROADMAPS[id];

  const pdf = await PDFDocument.create();
  pdf.setTitle(`${track.name} roadmap | DeboisTech`);
  pdf.setAuthor("DeboisTech");
  pdf.setSubject("Personalized beginner roadmap, DevFest Nashik 2026");
  // The same families as the website: Outfit for headings, Inter for text, JetBrains Mono for labels.
  pdf.registerFontkit(fontkit);
  const font = async (file: string) => pdf.embedFont(await readFile(path.join(process.cwd(), "assets", "fonts", file)), { subset: true });
  const display = await font("outfit-latin-800-normal.woff");
  const body = await font("inter-latin-600-normal.woff");
  const text = await font("inter-latin-500-normal.woff");
  const mono = await font("jetbrains-mono-latin-700-normal.woff");
  const logo = await pdf.embedPng(await asset("logo-dark.png"));
  const devfest = await pdf.embedPng(await asset("devfest-logo.png"));

  const pages: PDFPage[] = [];
  const bottom = M + 28;

  function newPage(): { page: PDFPage; y: number } {
    const page = pdf.addPage([W, H]);
    pages.push(page);
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.paper });
    const lw = 128;
    const lh = (logo.height / logo.width) * lw;
    page.drawImage(logo, { x: M, y: H - M - lh, width: lw, height: lh });
    const dh = 30;
    const dw = (devfest.width / devfest.height) * dh;
    page.drawImage(devfest, { x: W - M - dw, y: H - M - dh + 4, width: dw, height: dh });
    return { page, y: H - M - Math.max(lh, dh) - 22 };
  }

  let { page, y } = newPage();

  // ---- Title block
  page.drawText("YOUR PERSONALIZED ROADMAP", { x: M, y: y - 9, size: 8.5, font: mono, color: C.brandStrong });
  y -= 24;
  for (const line of wrap(track.name, display, 28, CW)) {
    page.drawText(line, { x: M, y: y - 24, size: 28, font: display, color: C.ink });
    y -= 33;
  }
  y -= 2;
  for (const line of wrap(`${track.tagline} A beginner-friendly 8-week path you can follow at your own pace, alongside college or work.`, text, 11, CW)) {
    page.drawText(line, { x: M, y: y - 11, size: 11, font: text, color: C.muted });
    y -= 15;
  }
  y -= 14;

  // ---- Career path
  page.drawText("WHERE THIS CAN LEAD", { x: M, y: y - 8, size: 8, font: mono, color: C.muted });
  y -= 18;
  {
    const lines = wrap(track.careerPath, body, 11, CW - 24);
    const h = lines.length * 15 + 18;
    box(page, M, y, CW - 3, h);
    lines.forEach((l, i) => page.drawText(l, { x: M + 12, y: y - 22 - i * 15, size: 11, font: body, color: C.ink }));
    y -= h + 22;
  }

  page.drawText("YOUR PATH, STEP BY STEP", { x: M, y: y - 8, size: 8, font: mono, color: C.muted });
  y -= 22;

  // ---- Stages
  const cardX = M + 50;
  const cardW = CW - 50 - 3;
  const inner = cardW - 24;
  let prevCircle: { page: PDFPage; cy: number } | null = null;

  stages.forEach((s, i) => {
    const titleLines = wrap(s.title, display, 15, inner);
    const topicLines = s.topics.map((t) => wrap(t, body, 10.5, inner - 14));
    const mileLines = wrap(s.milestone, body, 10.5, inner - 16);
    const topicH = topicLines.reduce((n, l) => n + l.length * 14 + 2, 0);
    const mileH = 16 + mileLines.length * 14 + 10;
    const cardH = 12 + 16 + 8 + titleLines.length * 18 + 4 + topicH + 8 + mileH + 12;

    if (y - cardH < bottom) {
      ({ page, y } = newPage());
      prevCircle = null;
    }

    // number circle + dashed connector from the previous stage
    const cx = M + 18;
    const cy = y - 22;
    if (prevCircle && prevCircle.page === page) {
      page.drawLine({ start: { x: cx, y: prevCircle.cy - 20 }, end: { x: cx, y: cy + 20 }, thickness: 1.5, color: C.ink, opacity: 0.4, dashArray: [4, 3] });
    }
    page.drawCircle({ x: cx + 2, y: cy - 2, size: 18, color: C.ink });
    page.drawCircle({ x: cx, y: cy, size: 18, color: C.brand, borderColor: C.ink, borderWidth: 1.5 });
    const num = String(i + 1);
    page.drawText(num, { x: cx - display.widthOfTextAtSize(num, 16) / 2, y: cy - 5.5, size: 16, font: display, color: C.white });
    prevCircle = { page, cy };

    box(page, cardX, y, cardW, cardH);
    let ty = y - 12;
    // pace pill
    const paceW = mono.widthOfTextAtSize(safe(s.pace), 8) + 16;
    page.drawRectangle({ x: cardX + 12, y: ty - 16, width: paceW, height: 16, color: C.sun, borderColor: C.ink, borderWidth: 1, opacity: 1 });
    page.drawText(safe(s.pace), { x: cardX + 20, y: ty - 11.5, size: 8, font: mono, color: C.ink });
    ty -= 16 + 8;
    titleLines.forEach((l) => {
      page.drawText(l, { x: cardX + 12, y: ty - 14, size: 15, font: display, color: C.ink });
      ty -= 18;
    });
    ty -= 4;
    topicLines.forEach((lines) => {
      page.drawText("•", { x: cardX + 12, y: ty - 10, size: 10.5, font: body, color: C.brandStrong });
      lines.forEach((l, k) => page.drawText(l, { x: cardX + 26, y: ty - 10 - k * 14, size: 10.5, font: body, color: C.body }));
      ty -= lines.length * 14 + 2;
    });
    ty -= 8;
    box(page, cardX + 12, ty, inner, mileH, C.sun, true);
    page.drawText("MILESTONE", { x: cardX + 20, y: ty - 14, size: 8, font: mono, color: C.brandStrong });
    mileLines.forEach((l, k) => page.drawText(l, { x: cardX + 20, y: ty - 28 - k * 14, size: 10.5, font: body, color: C.ink }));

    y -= cardH + 20;
  });

  // ---- Skills
  {
    const need = 60;
    if (y - need < bottom) ({ page, y } = newPage());
    page.drawText("SKILLS TO EXPLORE", { x: M, y: y - 8, size: 8, font: mono, color: C.muted });
    y -= 20;
    let x = M;
    for (const sk of track.skills) {
      const t = safe(sk);
      const w = body.widthOfTextAtSize(t, 10) + 20;
      if (x + w > W - M) {
        x = M;
        y -= 26;
      }
      page.drawRectangle({ x, y: y - 20, width: w, height: 20, color: C.white, borderColor: C.ink, borderWidth: 1.2 });
      page.drawText(t, { x: x + 10, y: y - 14, size: 10, font: body, color: C.ink });
      x += w + 8;
    }
    y -= 40;
  }

  // ---- Closing panel
  {
    const lines = wrap("Talk to the DeboisTech team about this path in a free consultation. Ask any team member at the DeboisTech zone.", body, 11, CW - 32);
    const h = 16 + 22 + lines.length * 15 + 18;
    const contacts: [string, string][] = [["Email:", CONTACT.email], ["Phone:", CONTACT.phone], ["Office Address:", CONTACT.address]];
    const labelW = Math.max(...contacts.map(([l]) => mono.widthOfTextAtSize(l, 10))) + 12;
    const addrLines = wrap(CONTACT.address, body, 12, CW - labelW);
    const contactH = 14 + 6 + 2 * 18 + addrLines.length * 16;
    if (y - h - 16 - contactH < bottom) ({ page, y } = newPage());
    box(page, M, y, CW - 3, h, C.brand);
    page.drawText("Want help along the way?", { x: M + 16, y: y - 33, size: 18, font: display, color: C.white });
    lines.forEach((l, k) => page.drawText(l, { x: M + 16, y: y - 54 - k * 15, size: 11, font: body, color: C.white }));
    y -= h + 18;

    // Contact details sit just below the panel, as plain text.
    page.drawText("CONTACT US", { x: M, y: y - 8, size: 8, font: mono, color: C.muted });
    y -= 22;
    for (const [label, value] of contacts) {
      const lines = label === "Office Address:" ? addrLines : [safe(value)];
      page.drawText(label, { x: M, y: y - 10, size: 10, font: mono, color: C.brandStrong });
      lines.forEach((l, k) => page.drawText(l, { x: M + labelW, y: y - 10 - k * 16, size: 12, font: body, color: C.ink }));
      y -= Math.max(18, lines.length * 16 + 2);
    }
  }

  // ---- Footers
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: M, y: M + 14 }, end: { x: W - M, y: M + 14 }, thickness: 1, color: C.ink, opacity: 0.25, dashArray: [4, 3] });
    p.drawText(`${COMPANY.name}  |  ${COMPANY.website}`, { x: M, y: M, size: 8, font: text, color: C.muted });
    const label = `Page ${i + 1} of ${pages.length}`;
    p.drawText(label, { x: W - M - text.widthOfTextAtSize(label, 8), y: M, size: 8, font: text, color: C.muted });
  });

  return pdf.save();
}
