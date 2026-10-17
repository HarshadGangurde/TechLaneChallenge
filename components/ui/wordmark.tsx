import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";

export function Wordmark() {
  return (
    <Link href="/" className="inline-flex min-h-11 items-center" aria-label="DeboisTech home">
      <BrandLogo variant="dark" className="h-8 sm:h-9" priority />
    </Link>
  );
}
