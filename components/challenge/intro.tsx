"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { XP_CORRECT, XP_PREFERENCE } from "@/lib/scoring";

export function IntroScreen({ total, onStart }: { total: number; onStart: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);

  const rules = [
    { icon: "🎯", title: `${total} quick questions`, text: "Scenarios, mini-debugging and what you enjoy building. About 2–4 minutes." },
    { icon: "⚡", title: "Earn XP as you go", text: `+${XP_CORRECT} XP for a correct answer, +${XP_PREFERENCE} XP for each preference question.` },
    { icon: "🧭", title: "No pressure", text: "Preference questions have no wrong answers, and every answer comes with a short tip. No experience needed." },
    { icon: "🏅", title: "Unlock your badge", text: "Finish to earn the Tech Explorer badge and see your suggested tech lane. No contact details needed." },
  ];

  return (
    <section aria-labelledby="intro" className="animate-rise pt-6">
      <p className="font-mono text-xs uppercase tracking-widest text-brand">Before you start</p>
      <h1 id="intro" ref={heading} tabIndex={-1} className="mt-2 text-3xl font-extrabold leading-tight outline-none sm:text-4xl">
        Ready to find your tech lane?
      </h1>
      <ul className="mt-6 grid gap-3">
        {rules.map((r) => (
          <li key={r.title} className="flex gap-3 rounded-2xl border border-line bg-panel p-4">
            <span aria-hidden className="text-2xl">{r.icon}</span>
            <div>
              <h2 className="font-bold">{r.title}</h2>
              <p className="mt-0.5 text-sm text-muted">{r.text}</p>
            </div>
          </li>
        ))}
      </ul>
      <Button onClick={onStart} className="mt-6 w-full text-lg">
        Begin →
      </Button>
    </section>
  );
}
