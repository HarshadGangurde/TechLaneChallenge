import { SOCIAL_LINKS } from "@/lib/constants";

const LINKS = [
  { key: "website", label: "DeboisTech website" },
  { key: "instagram", label: "DeboisTech on Instagram" },
  { key: "linkedin", label: "DeboisTech on LinkedIn" },
  { key: "x", label: "DeboisTech on X" },
] as const;

export function SocialLinks() {
  return (
    <ul className="flex items-center gap-2">
      {LINKS.map(({ key, label }) => (
        <li key={key}>
          <a
            href={SOCIAL_LINKS[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <span
              aria-hidden="true"
              className="h-5 w-5 bg-current"
              style={{ maskImage: `url(/social/${key}.png)`, WebkitMaskImage: `url(/social/${key}.png)`, maskSize: "contain", WebkitMaskSize: "contain", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat", maskPosition: "center", WebkitMaskPosition: "center" }}
            />
          </a>
        </li>
      ))}
    </ul>
  );
}
