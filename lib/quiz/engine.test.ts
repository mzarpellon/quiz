import { describe, expect, it } from "vitest";
import { computeBreakdown, computeScore, type Answer, type Question } from "./engine";

const questions: Question[] = [
  {
    id: "q1",
    statement: "q1",
    correctAnswer: true,
    explanation: "",
    category: "negocio",
    level: "basico",
  },
  {
    id: "q2",
    statement: "q2",
    correctAnswer: false,
    explanation: "",
    category: "negocio",
    level: "intermediario",
  },
  {
    id: "q3",
    statement: "q3",
    correctAnswer: true,
    explanation: "",
    category: "avancado",
    level: "avancado",
  },
];

describe("computeScore", () => {
  it("scores every answer correct", () => {
    const answers: Answer[] = [
      { questionId: "q1", userAnswer: true, isCorrect: true },
      { questionId: "q2", userAnswer: false, isCorrect: true },
    ];
    expect(computeScore(answers)).toEqual({ score: 2, total: 2, percentage: 100 });
  });

  it("scores every answer incorrect", () => {
    const answers: Answer[] = [
      { questionId: "q1", userAnswer: false, isCorrect: false },
      { questionId: "q2", userAnswer: true, isCorrect: false },
    ];
    expect(computeScore(answers)).toEqual({ score: 0, total: 2, percentage: 0 });
  });

  it("scores a mixed result and rounds the percentage", () => {
    const answers: Answer[] = [
      { questionId: "q1", userAnswer: true, isCorrect: true },
      { questionId: "q2", userAnswer: true, isCorrect: false },
      { questionId: "q3", userAnswer: true, isCorrect: true },
    ];
    expect(computeScore(answers)).toEqual({ score: 2, total: 3, percentage: 67 });
  });

  it("handles zero answers without dividing by zero", () => {
    expect(computeScore([])).toEqual({ score: 0, total: 0, percentage: 0 });
  });
});

describe("computeBreakdown", () => {
  it("groups correctness by category and by level", () => {
    const answers: Answer[] = [
      { questionId: "q1", userAnswer: true, isCorrect: true },
      { questionId: "q2", userAnswer: true, isCorrect: false },
      { questionId: "q3", userAnswer: true, isCorrect: true },
    ];

    expect(computeBreakdown(questions, answers)).toEqual({
      byCategory: {
        negocio: { correct: 1, total: 2 },
        avancado: { correct: 1, total: 1 },
      },
      byLevel: {
        basico: { correct: 1, total: 1 },
        intermediario: { correct: 0, total: 1 },
        avancado: { correct: 1, total: 1 },
      },
    });
  });

  it("omits categories and levels that had no questions in the match", () => {
    const answers: Answer[] = [{ questionId: "q1", userAnswer: true, isCorrect: true }];

    const breakdown = computeBreakdown(questions, answers);
    expect(breakdown.byCategory.avancado).toBeUndefined();
    expect(breakdown.byLevel.avancado).toBeUndefined();
    expect(breakdown.byCategory.negocio).toEqual({ correct: 1, total: 1 });
  });
});
