"use client";

import { Button } from "@/components/ui/button";
import { Shell } from "@/components/ui/shell";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Shell>
      <section role="alert" className="flex flex-col items-start gap-4 pt-16">
        <h1 className="text-3xl font-bold">Something went wrong</h1>
        <p className="text-muted">Your progress is saved on this device. Please try again.</p>
        <Button onClick={reset}>Try again</Button>
      </section>
    </Shell>
  );
}
