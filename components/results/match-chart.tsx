import { getTrack } from "@/lib/tracks";
import type { TrackId, TrackScores } from "@/types";

/** Relative strength of each lane for this student's answers. Scores are fit signals, not ability. */
export function MatchChart({ ranking, scores }: { ranking: TrackId[]; scores: TrackScores }) {
  const top = Math.max(1, ...ranking.map((id) => scores[id]));
  return (
    <section aria-labelledby="match" className="mt-6 rounded-2xl border border-line bg-panel p-4">
      <h2 id="match" className="font-mono text-xs uppercase tracking-widest text-muted">How your answers lined up</h2>
      <ul className="mt-3 space-y-2.5">
        {ranking.map((id, i) => (
          <li key={id}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className={i === 0 ? "font-semibold" : "text-muted"}>{getTrack(id).shortName}</span>
              <span className="font-mono text-xs text-muted">{scores[id]} {scores[id] === 1 ? "pt" : "pts"}</span>
            </div>
            <div aria-hidden className="mt-1 h-2 overflow-hidden rounded-full bg-panel-2">
              <div className={`h-full rounded-full ${i === 0 ? "bg-brand" : "bg-brand/40"}`} style={{ width: `${Math.max(3, (scores[id] / top) * 100)}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">Points come from your answers on this run. They show fit, not ability.</p>
    </section>
  );
}
