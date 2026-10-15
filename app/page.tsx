import { LandingTracker } from "@/components/landing/landing-tracker";
import { LaneCard } from "@/components/landing/lane-card";
import { PixelDoodle } from "@/components/landing/pixel-doodle";
import { ButtonLink } from "@/components/ui/button";
import { Shell } from "@/components/ui/shell";
import { QUESTIONS_PER_RUN } from "@/lib/question-set";
import { TRACK_LIST } from "@/lib/tracks";

const steps = [
  { n: "1", title: "Play", text: `Answer ${QUESTIONS_PER_RUN} quick questions: scenarios, mini-debugging and what you enjoy building. No experience needed.` },
  { n: "2", title: "Discover", text: "Earn XP, unlock your Tech Explorer badge and see which of six tech lanes fits you." },
  { n: "3", title: "Choose", text: "Pick the lane you actually want. The suggestion is a guide, you are in control." },
];

const stats = [
  { value: String(QUESTIONS_PER_RUN), label: "Questions" },
  { value: "3", label: "Minutes" },
  { value: "6", label: "Tech lanes" },
];

const laneColours = ["bg-lane-blue", "bg-lane-green", "bg-lane-pink", "bg-lane-sand", "bg-lane-lilac", "bg-lane-sun"];
const laneTilt = ["-rotate-1", "rotate-1", "rotate-1", "-rotate-1", "-rotate-1", "rotate-1"];

export default function Home() {
  return (
    <Shell>
      <LandingTracker />
      <section className="animate-rise relative pt-6 sm:pt-12">
        <PixelDoodle className="animate-bob pointer-events-none absolute -top-2 right-0 w-20 sm:w-32" />
        <p className="pr-24 font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted">Find your tech lane</p>
        <h1 className="mt-4 font-display text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-8xl">
          YOUR TECH.
          <span className="nb-shadow mt-2 inline-block -rotate-1 rounded-2xl border-2 border-ink bg-brand px-3 pb-1 text-white">
            YOUR PATH.
          </span>
        </h1>
        <p className="mt-6 text-xl font-medium text-[#3e3730]">Take the challenge. Discover your tech lane.</p>
        <p className="mt-3 max-w-xl text-muted">
          A short, game-style challenge that helps you explore technology careers. Answer scenario and
          preference questions, collect XP, and get a track suggestion. Seeing your result never requires
          your contact details.
        </p>

        <dl className="mt-8 grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="nb-card px-2 py-3 text-center">
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-4xl font-extrabold leading-none">{s.value}</dd>
              <p aria-hidden className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-muted">{s.label}</p>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/challenge" className="text-lg sm:min-w-56">
            Start Challenge →
          </ButtonLink>
          <ButtonLink href="#how" variant="secondary" className="text-lg">
            How it works
          </ButtonLink>
        </div>
      </section>

      <section aria-labelledby="how-title" id="how" className="mt-16 scroll-mt-6">
        <h2 id="how-title" className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-muted">How it works</h2>
        <ol className="mt-5">
          {steps.map((s, i) => (
            <li
              key={s.n}
              className={`relative pb-6 pl-16 ${i < steps.length - 1 ? "before:absolute before:left-6 before:top-12 before:bottom-0 before:border-l-2 before:border-dashed before:border-ink/40" : ""}`}
            >
              <span aria-hidden className="nb-shadow-sm absolute left-0 top-0 grid size-12 place-items-center rounded-full border-2 border-ink bg-brand text-white font-display text-xl font-extrabold">
                {s.n}
              </span>
              <div className="nb-card p-4">
                <h3 className="font-display text-xl font-extrabold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="lanes" className="mt-10">
        <h2 id="lanes" className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-muted">Six tech lanes to discover</h2>
        <p className="mt-2 text-sm text-muted">
          This challenge doesn&apos;t rank you. It only points you to the domain that fits you best, so you know where to start.
        </p>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TRACK_LIST.map((t, i) => (
            <LaneCard key={t.id} track={t} tone={laneColours[i % 6]} tilt={laneTilt[i % 6]} />
          ))}
        </ul>
      </section>

      <section className="nb-card mt-12 flex flex-col items-start gap-4 bg-brand p-6 text-white">
        <h2 className="font-display text-3xl font-extrabold leading-tight">Ready to find your lane?</h2>
        <p className="font-medium text-white">It takes about three minutes. Your result is yours, no contact details needed.</p>
        <ButtonLink href="/challenge" variant="secondary" className="text-lg">
          Start Challenge →
        </ButtonLink>
      </section>
    </Shell>
  );
}
