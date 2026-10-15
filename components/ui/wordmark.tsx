import Image from "next/image";
import Link from "next/link";

export function Wordmark() {
  return (
    <Link href="/" className="inline-flex min-h-11 items-center gap-2 font-display text-xl font-extrabold tracking-tight" aria-label="DeboisTech home">
      <Image src="/logo.png" alt="" width={54} height={32} priority className="h-8 w-auto" />
      <span>
        Debois<span className="text-brand-strong">Tech</span>
      </span>
    </Link>
  );
}
