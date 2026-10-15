import Link from "next/link";
import type { ComponentProps, Ref } from "react";

const base =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";
const variants = {
  primary: "bg-brand text-black hover:bg-[#3df07f] disabled:hover:bg-brand",
  secondary: "border border-line bg-panel-2 text-white hover:border-brand/60",
  ghost: "text-muted hover:text-white",
} as const;

type Variant = keyof typeof variants;

export function Button({ variant = "primary", className = "", ...props }: ComponentProps<"button"> & { variant?: Variant; ref?: Ref<HTMLButtonElement> }) {
  return <button {...props} className={`${base} ${variants[variant]} ${className}`} />;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link {...props} className={`${base} ${variants[variant]} ${className}`} />;
}

export function Spinner() {
  return (
    <span aria-hidden className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}
