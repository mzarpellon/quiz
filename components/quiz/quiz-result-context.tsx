"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Breakdown } from "@/lib/quiz/engine";

export type QuizResult = {
  score: number;
  total: number;
  percentage: number;
  breakdown: Breakdown;
  attemptId: string | null;
};

type ContextValue = {
  result: QuizResult | null;
  setResult: (result: QuizResult | null) => void;
};

const QuizResultContext = createContext<ContextValue | null>(null);

export function QuizResultProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<QuizResult | null>(null);
  return (
    <QuizResultContext.Provider value={{ result, setResult }}>
      {children}
    </QuizResultContext.Provider>
  );
}

export function useQuizResult() {
  const context = useContext(QuizResultContext);
  if (!context) {
    throw new Error("useQuizResult must be used within a QuizResultProvider");
  }
  return context;
}
