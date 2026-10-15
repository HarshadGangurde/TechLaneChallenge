import type { ReactNode } from "react";

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: (a: { id: string; "aria-describedby": string | undefined; "aria-invalid": boolean }) => ReactNode;
}

export const inputClass =
  "min-h-12 w-full rounded-xl border-2 border-line bg-panel px-4 py-3 text-base text-white placeholder:text-muted/70 focus:border-brand aria-invalid:border-danger";

export function Field({ id, label, required, hint, error, children }: FieldProps) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}{" "}
        <span className={required ? "text-brand" : "font-normal text-muted"}>{required ? "*" : "(optional)"}</span>
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": !!error })}
      {hint && <p id={`${id}-hint`} className="mt-1 text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
