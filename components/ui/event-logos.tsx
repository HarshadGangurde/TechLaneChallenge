import Image from "next/image";

/** Official DevFest Nashik 2026 mark, as published on the event site. */
export function DevFestMark({ className = "h-8" }: { className?: string }) {
  return <Image src="/devfest-logo.svg" alt="DevFest Nashik 2026" width={638} height={182} className={`${className} w-auto`} />;
}

/** Google Developer Groups Nashik lockup (the event's organiser). */
export function GdgNashikLockup({ className = "h-7" }: { className?: string }) {
  return <Image src="/gdg-nashik-lockup.svg" alt="Google Developer Groups Nashik" width={1098} height={155} className={`${className} w-auto`} />;
}
