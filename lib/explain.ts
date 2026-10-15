import { getTrack } from "@/lib/tracks";
import { QUESTIONS } from "@/lib/questions";
import type { Question, Recommendation } from "@/types";

/** Plain-language reason for a recommendation, built only from the user's own answers. */
export function explainRecommendation(
  rec: Pick<Recommendation, "primary" | "secondary" | "reasons">,
  questions: Question[] = QUESTIONS,
): string {
  const track = getTrack(rec.primary);
  const categories = [
    ...new Set(rec.reasons.map((id) => questions.find((q) => q.id === id)?.category).filter(Boolean)),
  ].slice(0, 3) as string[];

  let text = `Your answers pointed most towards ${track.name}`;
  text += categories.length ? `, especially in ${listJoin(categories.map((c) => c.toLowerCase()))} questions.` : ".";
  if (rec.secondary) {
    text += ` ${getTrack(rec.secondary).shortName} scored very close behind, so it is worth a look too.`;
  }
  return text;
}

function listJoin(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
