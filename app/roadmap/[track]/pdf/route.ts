import { notFound } from "next/navigation";
import { buildRoadmapPdf } from "@/lib/roadmap-pdf";
import { isTrackId, TRACK_LIST } from "@/lib/tracks";

// Built once at build time: the roadmaps are static content.
export const dynamic = "force-static";

export function generateStaticParams() {
  return TRACK_LIST.map((t) => ({ track: t.id }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ track: string }> }) {
  const { track } = await params;
  if (!isTrackId(track)) notFound();
  const bytes = await buildRoadmapPdf(track);
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="DeboisTech-${track}-roadmap.pdf"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
