import type { Metadata } from "next";
import { ExportForm } from "@/components/consultation/export-form";
import { Shell } from "@/components/ui/shell";

export const metadata: Metadata = { title: "Staff export | DeboisTech", robots: { index: false, follow: false } };

export default function AdminExportPage() {
  return (
    <Shell>
      <ExportForm />
    </Shell>
  );
}
