import { createServerClient } from "@/lib/supabase/server";
import {
  SKI_FAQ_PREVIEW,
  type FaqPreviewEntry,
} from "./skiFaqData";

export type { FaqPreviewEntry } from "./skiFaqData";

function parseFaqRow(row: Record<string, unknown>): FaqPreviewEntry | null {
  if (
    typeof row.id !== "string" ||
    typeof row.question_en !== "string" ||
    typeof row.question_de !== "string" ||
    typeof row.answer_en !== "string" ||
    typeof row.answer_de !== "string"
  ) {
    return null;
  }
  const tags = Array.isArray(row.tags)
    ? row.tags.filter((tag): tag is string => typeof tag === "string")
    : [];
  return {
    id: row.id,
    question_en: row.question_en,
    question_de: row.question_de,
    answer_en: row.answer_en,
    answer_de: row.answer_de,
    tags,
  };
}

export async function loadFaqPreview(limit = 4): Promise<FaqPreviewEntry[]> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("faq_entries")
      .select("id, question_en, question_de, answer_en, answer_de, tags")
      .limit(limit);

    if (error || !data?.length) {
      return [...SKI_FAQ_PREVIEW].slice(0, limit);
    }

    const parsed = data
      .map((row) => parseFaqRow(row as Record<string, unknown>))
      .filter((entry): entry is FaqPreviewEntry => entry !== null);

    return parsed.length > 0 ? parsed : [...SKI_FAQ_PREVIEW].slice(0, limit);
  } catch {
    return [...SKI_FAQ_PREVIEW].slice(0, limit);
  }
}

export function getFaqCopy(
  entry: FaqPreviewEntry,
  locale: "en" | "de" = "en",
): { question: string; answer: string } {
  if (locale === "de") {
    return { question: entry.question_de, answer: entry.answer_de };
  }
  return { question: entry.question_en, answer: entry.answer_en };
}
