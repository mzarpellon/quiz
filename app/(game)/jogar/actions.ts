"use server";

import { createClient } from "@/lib/supabase/server";
import type { Breakdown } from "@/lib/quiz/engine";

type SaveAttemptInput = {
  startedAt: string;
  score: number;
  totalQuestions: number;
  breakdown: Breakdown;
  answers: { questionId: string; userAnswer: boolean; isCorrect: boolean }[];
};

// No-ops (returns saved: false) for anonymous players — anonymous results are
// intentionally never persisted (PRD §4.1). The caller doesn't need to know
// whether a session exists; this checks it server-side via the auth cookie.
export async function saveAttempt(input: SaveAttemptInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { saved: false as const };

  const { data: attempt, error } = await supabase
    .from("quiz_attempts")
    .insert({
      user_id: user.id,
      score: input.score,
      total_questions: input.totalQuestions,
      breakdown: input.breakdown,
      started_at: input.startedAt,
    })
    .select("id")
    .single();

  if (error || !attempt) return { saved: false as const };

  if (input.answers.length > 0) {
    await supabase.from("quiz_attempt_answers").insert(
      input.answers.map((answer) => ({
        attempt_id: attempt.id,
        question_id: answer.questionId,
        user_answer: answer.userAnswer,
        is_correct: answer.isCorrect,
      })),
    );
  }

  return { saved: true as const, attemptId: attempt.id };
}
