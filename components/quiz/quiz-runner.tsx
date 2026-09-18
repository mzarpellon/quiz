"use client";

import { useEffect, useReducer, useRef } from "react";
import { useRouter } from "next/navigation";
import { saveAttempt } from "@/app/(game)/jogar/actions";
import { QuestionCard } from "@/components/quiz/question-card";
import { useQuizResult } from "@/components/quiz/quiz-result-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { computeBreakdown, computeScore, type Answer, type Question } from "@/lib/quiz/engine";
import { getRandomQuestions } from "@/lib/quiz/fetch-questions";

const QUESTION_COUNT = 12;

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "playing"; questions: Question[]; index: number; answers: Answer[]; revealed: boolean }
  | { status: "finished"; questions: Question[]; answers: Answer[] };

type Action =
  | { type: "QUESTIONS_LOADED"; questions: Question[] }
  | { type: "LOAD_FAILED" }
  | { type: "ANSWER_SELECTED"; answer: boolean }
  | { type: "NEXT_PRESSED" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "QUESTIONS_LOADED":
      return { status: "playing", questions: action.questions, index: 0, answers: [], revealed: false };
    case "LOAD_FAILED":
      return { status: "error" };
    case "ANSWER_SELECTED": {
      if (state.status !== "playing" || state.revealed) return state;
      const question = state.questions[state.index];
      const isCorrect = action.answer === question.correctAnswer;
      return {
        ...state,
        answers: [...state.answers, { questionId: question.id, userAnswer: action.answer, isCorrect }],
        revealed: true,
      };
    }
    case "NEXT_PRESSED": {
      if (state.status !== "playing") return state;
      if (state.index + 1 >= state.questions.length) {
        return { status: "finished", questions: state.questions, answers: state.answers };
      }
      return { ...state, index: state.index + 1, revealed: false };
    }
    default:
      return state;
  }
}

export function QuizRunner() {
  const [state, dispatch] = useReducer(reducer, { status: "loading" });
  const { setResult } = useQuizResult();
  const router = useRouter();
  const startedAtRef = useRef(new Date().toISOString());
  const finishedHandledRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    getRandomQuestions(QUESTION_COUNT)
      .then((questions) => {
        if (!cancelled) dispatch({ type: "QUESTIONS_LOADED", questions });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "LOAD_FAILED" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (state.status !== "finished" || finishedHandledRef.current) return;
    finishedHandledRef.current = true;

    const { score, total, percentage } = computeScore(state.answers);
    const breakdown = computeBreakdown(state.questions, state.answers);

    saveAttempt({
      startedAt: startedAtRef.current,
      score,
      totalQuestions: total,
      breakdown,
      answers: state.answers,
    }).then((result) => {
      setResult({
        score,
        total,
        percentage,
        breakdown,
        attemptId: result.saved ? result.attemptId : null,
      });
      router.push("/resultado");
    });
  }, [state, setResult, router]);

  if (state.status === "loading" || state.status === "finished") {
    return <Skeleton className="h-80 w-full max-w-lg" />;
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-muted-foreground">Não foi possível carregar as perguntas.</p>
        <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
      </div>
    );
  }

  const question = state.questions[state.index];
  const currentAnswer = state.answers[state.index]?.userAnswer ?? null;

  return (
    <QuestionCard
      question={question}
      progress={`Pergunta ${state.index + 1} de ${state.questions.length}`}
      revealed={state.revealed}
      userAnswer={currentAnswer}
      isLast={state.index === state.questions.length - 1}
      onAnswer={(answer) => dispatch({ type: "ANSWER_SELECTED", answer })}
      onNext={() => dispatch({ type: "NEXT_PRESSED" })}
    />
  );
}
