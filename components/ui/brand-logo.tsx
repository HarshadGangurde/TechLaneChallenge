import Image from "next/image";

/** Full DeboisTech lockup. Pick the variant that suits the background: dark text on light, white text on dark or green, grey for quiet spots like footers. */
export function BrandLogo({ variant = "dark", className = "h-9", priority = false }: { variant?: "dark" | "grey" | "white"; className?: string; priority?: boolean }) {
  return <Image src={`/logo-${variant}.png`} alt="" width={900} height={187} priority={priority} className={`${className} w-auto`} />;
}
