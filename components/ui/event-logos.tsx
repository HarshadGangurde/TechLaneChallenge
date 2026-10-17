import Image from "next/image";

/** DevFest Nashik 2026 mark. */
export function DevFestMark({ className = "h-8" }: { className?: string }) {
  return <Image src="/devfest-logo.png" alt="DevFest Nashik 2026" width={640} height={183} className={`${className} w-auto`} priority />;
}
