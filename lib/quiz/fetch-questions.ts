import { createClient } from "@/lib/supabase/client";
import type { Question } from "./engine";
import type { Tables } from "@/lib/supabase/database.types";

function toQuestion(row: Tables<"questions">): Question {
  return {
    id: row.id,
    statement: row.statement,
    correctAnswer: row.correct_answer,
    explanation: row.explanation,
    category: row.category as Question["category"],
    level: row.level as Question["level"],
  };
}

export async function getRandomQuestions(count: number): Promise<Question[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_random_questions", {
    question_count: count,
  });

  if (error) throw error;
  return (data ?? []).map(toQuestion);
}
