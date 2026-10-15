import type { Metadata } from "next";
import { Confirmation } from "@/components/consultation/confirmation";
import { Shell } from "@/components/ui/shell";

export const metadata: Metadata = { title: "Request Submitted | DeboisTech" };

export default function ConfirmationPage() {
  return (
    <Shell>
      <Confirmation />
    </Shell>
  );
}
