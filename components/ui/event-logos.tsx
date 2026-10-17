import Image from "next/image";

/** DevFest Nashik 2026 mark. */
export function DevFestMark({ className = "h-8" }: { className?: string }) {
  return <Image src="/devfest-logo.png" alt="DevFest Nashik 2026" width={640} height={183} className={`${className} w-auto`} priority />;
}

/** Google Developer Groups Nashik lockup (the event's organiser). */
export function GdgNashikLockup({ className = "h-7" }: { className?: string }) {
  return <Image src="/gdg-nashik-lockup.svg" alt="Google Developer Groups Nashik" width={1098} height={155} className={`${className} w-auto`} />;
}
