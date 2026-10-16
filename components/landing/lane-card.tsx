import type { Track, TrackId } from "@/types";

/** A fake code window per lane: just flavour, so students can picture the kind of work. */
const WINDOW: Record<TrackId, { file: string; code: string }> = {
  "ai-ml": { file: "model.py", code: "fit(data)" },
  "cloud-devops": { file: "deploy.sh", code: "deploy()" },
  fde: { file: "client.ts", code: "solve(it)" },
  mobile: { file: "App.tsx", code: "app.run()" },
  genai: { file: "prompt.md", code: 'llm("hi")' },
  "agentic-ai": { file: "agent.py", code: "agent.act()" },
};

export function LaneCard({ track, tone, tilt }: { track: Track; tone: string; tilt: string }) {
  const w = WINDOW[track.id];
  return (
    <li className={`nb-card flex flex-col overflow-hidden ${tilt}`}>
      <div aria-hidden className="flex items-center gap-1.5 border-b-2 border-ink bg-ink px-3 py-1.5">
        <span className="size-2 rounded-full bg-[#ff5f57]" />
        <span className="size-2 rounded-full bg-[#febc2e]" />
        <span className="size-2 rounded-full bg-[#28c840]" />
        <span className="ml-1 font-mono text-[10px] text-paper/80">{w.file}</span>
      </div>
      <div className={`${tone} flex flex-1 flex-col p-3`}>
        <span aria-hidden className="text-2xl">{track.emoji}</span>
        <p className="mt-1 font-display text-base font-extrabold leading-tight">{track.name}</p>
        <p className="mt-1 mb-3 text-xs text-[#3e3730]">{track.tagline}</p>
        <p aria-hidden className="mt-auto truncate rounded-md bg-ink px-2 py-1.5 font-mono text-[10px] text-[#9ee8b0] sm:text-[11px]">
          <span className="text-paper/60">&gt; </span>
          {w.code}
          <span className="animate-pulse">▍</span>
        </p>
      </div>
    </li>
  );
}
