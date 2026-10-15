import type { Metadata } from "next";
import { Results } from "@/components/results/results";
import { Shell } from "@/components/ui/shell";

export const metadata: Metadata = { title: "Your Tech Lane | DeboisTech" };

export default function ResultsPage() {
  return (
    <Shell>
      <Results />
    </Shell>
  );
}
