import { ButtonLink } from "@/components/ui/button";
import { Shell } from "@/components/ui/shell";

export default function NotFound() {
  return (
    <Shell>
      <section className="flex flex-col items-start gap-4 pt-16">
        <p className="font-mono text-sm text-muted">404</p>
        <h1 className="text-3xl font-bold">This lane doesn&apos;t exist</h1>
        <p className="text-muted">The page you were looking for isn&apos;t here. Head back and start the challenge.</p>
        <ButtonLink href="/">Back to start</ButtonLink>
      </section>
    </Shell>
  );
}
