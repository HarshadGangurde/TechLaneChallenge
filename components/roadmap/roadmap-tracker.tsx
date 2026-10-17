"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";
import { session } from "@/lib/session";

/** Fires roadmap_viewed once per visit. */
export function RoadmapTracker({ trackId }: { trackId: string }) {
  useEffect(() => {
    track("roadmap_viewed", { track: trackId, source: session.getSource() });
  }, [trackId]);
  return null;
}
