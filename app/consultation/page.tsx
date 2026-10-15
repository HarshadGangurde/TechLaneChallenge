import type { Metadata } from "next";
import { ConsultationForm } from "@/components/consultation/consultation-form";
import { Shell } from "@/components/ui/shell";

export const metadata: Metadata = { title: "Request a Free Consultation | DeboisTech" };

export default function ConsultationPage() {
  return (
    <Shell>
      <ConsultationForm />
    </Shell>
  );
}
