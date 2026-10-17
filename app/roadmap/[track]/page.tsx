import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoadmapCta } from "@/components/roadmap/roadmap-cta";
import { DownloadRoadmapButton } from "@/components/roadmap/download-button";
import { RoadmapTracker } from "@/components/roadmap/roadmap-tracker";
import { Shell } from "@/components/ui/shell";
import { ROADMAPS } from "@/lib/roadmaps";
import { getTrack, isTrackId, TRACK_LIST } from "@/lib/tracks";

type Params = Promise<{ track: string }>;

export function generateStaticParams() {
  return TRACK_LIST.map((t) => ({ track: t.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { track } = await params;
  return { title: isTrackId(track) ? `${getTrack(track).name} Roadmap | DeboisTech` : "Roadmap | DeboisTech" };
}

export default async function RoadmapPage({ params }: { params: Params }) {
  const { track: id } = await params;
  if (!isTrackId(id)) notFound();
  const track = getTrack(id);
  const stages = ROADMAPS[id];

  return (
    <Shell>
      <RoadmapTracker trackId={id} />
      <section className="animate-rise pt-4">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-brand-strong">Your personalized roadmap</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold leading-tight">
          <span aria-hidden className="mr-2">{track.emoji}</span>
          {track.name}
        </h1>
        <p className="mt-2 text-muted">{track.tagline} Here is a beginner-friendly path you can follow at your own pace, alongside college or work.</p>

        <DownloadRoadmapButton trackId={id} className="mt-5 w-full sm:w-auto" />

        <h2 className="mt-8 font-mono text-xs font-bold uppercase tracking-[0.25em] text-muted">Where this can lead</h2>
        <p className="nb-card mt-3 p-4 font-medium">{track.careerPath}</p>

        <h2 className="mt-8 font-mono text-xs font-bold uppercase tracking-[0.25em] text-muted">Your path, step by step</h2>
        <ol className="mt-5">
          {stages.map((s, i) => (
            <li
              key={s.title}
              className={`relative pb-6 pl-16 ${i < stages.length - 1 ? "before:absolute before:bottom-0 before:left-6 before:top-12 before:border-l-2 before:border-dashed before:border-ink/40" : ""}`}
            >
              <span aria-hidden className="nb-shadow-sm absolute left-0 top-0 grid size-12 place-items-center rounded-full border-2 border-ink bg-brand font-display text-xl font-extrabold text-white">
                {i + 1}
              </span>
              <div className="nb-card p-4">
                <p className="inline-block rounded-full border-2 border-ink bg-lane-sun px-3 py-0.5 font-mono text-xs font-bold">{s.pace}</p>
                <h3 className="mt-2 font-display text-xl font-extrabold">{s.title}</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#3e3730]">
                  {s.topics.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <div className="mt-3 rounded-xl border-2 border-dashed border-ink/50 bg-lane-sun p-3 text-sm">
                  <p className="font-mono text-xs font-bold uppercase tracking-widest text-brand-strong">Milestone</p>
                  <p className="mt-1">{s.milestone}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <h2 className="mt-4 font-mono text-xs font-bold uppercase tracking-[0.25em] text-muted">Skills to explore</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {track.skills.map((s) => (
            <li key={s} className="rounded-full border-2 border-ink bg-white px-3 py-1 text-sm">{s}</li>
          ))}
        </ul>

        <p className="mt-6 text-xs text-muted">
          Paces are only a guide. Everyone starts from a different place, so go faster or slower as you need. This is a suggestion, not a career prediction.
        </p>

        <RoadmapCta />
      </section>
    </Shell>
  );
}
