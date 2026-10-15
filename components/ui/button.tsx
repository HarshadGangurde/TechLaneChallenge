import Link from "next/link";
import type { ComponentProps, Ref } from "react";

const base =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 px-6 py-3 text-base font-bold transition active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:active:translate-x-0 disabled:active:translate-y-0";
const variants = {
  primary: "border-ink bg-brand text-white shadow-[4px_4px_0_0_#14110f] hover:bg-[#236a36] disabled:hover:bg-brand",
  secondary: "border-ink bg-white text-ink shadow-[4px_4px_0_0_#14110f] hover:bg-panel-2",
  ghost: "border-transparent px-3 text-muted underline-offset-4 hover:text-ink hover:underline",
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
