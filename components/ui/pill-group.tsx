interface PillGroupProps {
  name: string;
  legend: string;
  options: [value: string, label: string][];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  columns?: 2 | 3;
}

/** Radio buttons styled as large tappable pills. The first radio carries the group's id so error focus can land on it. */
export function PillGroup({ name, legend, options, value, onChange, error, columns = 2 }: PillGroupProps) {
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="mb-1.5 text-sm font-semibold">
        {legend} <span className="text-brand-strong">*</span>
      </legend>
      <div className={`grid gap-3 ${columns === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {options.map(([v, label], i) => (
          <label
            key={v}
            className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 px-4 py-3 has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-ink ${
              value === v ? "border-ink bg-brand/25 shadow-[3px_3px_0_0_#14110f]" : error ? "border-danger bg-white" : "border-ink bg-white"
            }`}
          >
            <input
              id={i === 0 ? name : undefined}
              type="radio"
              name={name}
              value={v}
              checked={value === v}
              onChange={() => onChange(v)}
              className="accent-[#3f9b50]"
            />
            {label}
          </label>
        ))}
      </div>
      {error && (
        <p id={`${name}-error`} role="alert" className="mt-1 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
