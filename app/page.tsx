import { LandingTracker } from "@/components/landing/landing-tracker";
import { ButtonLink } from "@/components/ui/button";
import { Shell } from "@/components/ui/shell";
import { TRACK_LIST } from "@/lib/tracks";

const steps = [
  { n: "01", title: "Play", text: "Answer 10 quick questions: scenarios, mini-debugging and what you enjoy building. No experience needed." },
  { n: "02", title: "Discover", text: "Earn XP, unlock your Tech Explorer badge and see which of six tech lanes fits you." },
  { n: "03", title: "Choose", text: "Pick the lane you actually want. The suggestion is a guide, you are in control." },
];

export default function Home() {
  return (
    <Shell>
      <LandingTracker />
      <section className="animate-rise pt-8 sm:pt-14">
        <p className="inline-block rounded-full border border-brand/40 bg-brand/10 px-3 py-1 font-mono text-xs text-brand">
          ⏱ About 2–4 minutes · no sign-up
        </p>
        <h1 className="mt-5 text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-7xl">
          YOUR TECH.
          <br />
          <span className="text-brand">YOUR PATH.</span>
        </h1>
        <p className="mt-5 text-xl text-[#cfe0d6]">Take the challenge. Discover your tech lane.</p>
        <p className="mt-3 max-w-xl text-muted">
          A short, game-style challenge that helps you explore technology careers. Answer scenario and
          preference questions, collect XP, and get a track suggestion. Seeing your result never requires
          your contact details.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/challenge" className="text-lg sm:min-w-56">
            Start Challenge →
          </ButtonLink>
        </div>
      </section>

      <section aria-labelledby="how" className="mt-14">
        <h2 id="how" className="font-mono text-sm uppercase tracking-widest text-muted">How it works</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="rounded-2xl border border-line bg-panel p-4">
              <span className="font-mono text-sm text-brand">{s.n}</span>
              <h3 className="mt-1 text-lg font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="lanes" className="mt-12">
        <h2 id="lanes" className="font-mono text-sm uppercase tracking-widest text-muted">Six tech lanes to discover</h2>
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TRACK_LIST.map((t) => (
            <li key={t.id} className="rounded-xl border border-line bg-panel px-3 py-3 text-sm font-medium">
              <span aria-hidden className="mr-1.5">{t.emoji}</span>
              {t.name}
            </li>
          ))}
        </ul>
      </section>
    </Shell>
  );
}
