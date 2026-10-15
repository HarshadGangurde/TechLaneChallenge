import Link from "next/link";

/** Text-only wordmark. No logo asset has been supplied, so none is invented. */
export function Wordmark() {
  return (
    <Link href="/" className="inline-flex items-center gap-2 font-mono text-lg font-bold tracking-tight" aria-label="DeboisTech home">
      <span aria-hidden className="text-brand">{"</>"}</span>
      <span>
        Debois<span className="text-brand">Tech</span>
      </span>
    </Link>
  );
}
