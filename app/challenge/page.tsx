import type { Metadata } from "next";
import { Challenge } from "@/components/challenge/challenge";
import { Shell } from "@/components/ui/shell";

export const metadata: Metadata = { title: "The Challenge | DeboisTech" };

export default function ChallengePage() {
  return (
    <Shell>
      <Challenge />
    </Shell>
  );
}
