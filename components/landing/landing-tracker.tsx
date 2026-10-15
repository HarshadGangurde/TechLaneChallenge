"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";
import { session } from "@/lib/session";

/** Fires landing_view once and captures the validated ?src= / ?campaign= params. */
export function LandingTracker() {
  useEffect(() => {
    session.captureCampaignParams();
    track("landing_view", { source: session.getSource() });
  }, []);
  return null;
}
