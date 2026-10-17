"use client";

import { buttonClasses } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { session } from "@/lib/session";

/** Downloads the roadmap as a PDF (a plain link, so it works without JavaScript too). */
export function DownloadRoadmapButton({ trackId, className = "" }: { trackId: string; className?: string }) {
  return (
    <a
      href={`/roadmap/${trackId}/pdf`}
      download
      onClick={() => track("roadmap_downloaded", { track: trackId, source: session.getSource() })}
      className={buttonClasses("primary", className)}
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12m0 0-5-5m5 5 5-5M4 20h16" />
      </svg>
      Download roadmap (PDF)
    </a>
  );
}
