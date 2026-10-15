import { Button } from "@/components/ui/button";
import type { Track } from "@/types";

interface Props {
  track: Track;
  selected: boolean;
  onChoose: (id: Track["id"]) => void;
  badge?: string;
  featured?: boolean;
  explanation?: string;
}

export function TrackDetails({ track }: { track: Track }) {
  return (
    <div className="mt-4 space-y-4 text-sm">
      <p className="text-[#cfe0d6]">{track.description}</p>
      <div>
        <h3 className="font-mono text-xs uppercase tracking-widest text-muted">Career path</h3>
        <p className="mt-1">{track.careerPath}</p>
      </div>
      <div>
        <h3 className="font-mono text-xs uppercase tracking-widest text-muted">Skills to explore</h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {track.skills.map((s) => (
            <li key={s} className="rounded-full border border-line bg-panel-2 px-3 py-1">{s}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-dashed border-brand/40 bg-brand/5 p-3">
        <h3 className="font-mono text-xs uppercase tracking-widest text-brand">Beginner project idea</h3>
        <p className="mt-1">{track.project}</p>
      </div>
    </div>
  );
}

function ChooseButton({ track, selected, onChoose, featured }: Pick<Props, "track" | "selected" | "onChoose" | "featured">) {
  return (
    <Button
      onClick={() => onChoose(track.id)}
      variant={selected ? "secondary" : featured ? "primary" : "secondary"}
      aria-pressed={selected}
      className={`mt-4 w-full ${selected ? "border-brand text-brand" : ""}`}
    >
      {selected ? `✓ Selected: ${track.shortName}` : featured ? "Choose This Track" : `Choose ${track.shortName}`}
    </Button>
  );
}

/** Large card for the primary / secondary recommendation. */
export function FeaturedTrackCard({ track, selected, onChoose, badge, featured, explanation }: Props) {
  return (
    <article className={`animate-rise rounded-2xl border-2 p-5 ${selected ? "border-brand bg-brand/10" : "border-line bg-panel"}`}>
      {badge && <p className="font-mono text-xs uppercase tracking-widest text-brand">{badge}</p>}
      <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
        <span aria-hidden className="mr-2">{track.emoji}</span>
        {track.name}
      </h2>
      <p className="mt-1 text-muted">{track.tagline}</p>
      {explanation && <p className="mt-3 rounded-xl bg-panel-2 p-3 text-sm">💡 {explanation}</p>}
      <TrackDetails track={track} />
      <ChooseButton track={track} selected={selected} onChoose={onChoose} featured={featured} />
    </article>
  );
}

/** Collapsed card for browsing the other tracks. */
export function CompactTrackCard({ track, selected, onChoose }: Props) {
  return (
    <details className={`group rounded-xl border p-4 ${selected ? "border-brand bg-brand/10" : "border-line bg-panel"}`}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold marker:hidden">
        <span>
          <span aria-hidden className="mr-2">{track.emoji}</span>
          {track.name}
          {selected && <span className="ml-2 text-xs text-brand">✓ selected</span>}
        </span>
        <span aria-hidden className="text-muted transition group-open:rotate-90">›</span>
      </summary>
      <p className="mt-1 text-sm text-muted">{track.tagline}</p>
      <TrackDetails track={track} />
      <ChooseButton track={track} selected={selected} onChoose={onChoose} />
    </details>
  );
}
