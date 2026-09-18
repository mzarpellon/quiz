export type Category = "negocio" | "cli_basico" | "avancado";
export type Level = "basico" | "intermediario" | "avancado";

export type Question = {
  id: string;
  statement: string;
  correctAnswer: boolean;
  explanation: string;
  category: Category;
  level: Level;
};

export type Answer = {
  questionId: string;
  userAnswer: boolean;
  isCorrect: boolean;
};

export type BreakdownEntry = { correct: number; total: number };

export type Breakdown = {
  byCategory: Partial<Record<Category, BreakdownEntry>>;
  byLevel: Partial<Record<Level, BreakdownEntry>>;
};

export function computeScore(answers: Answer[]) {
  const total = answers.length;
  const score = answers.filter((answer) => answer.isCorrect).length;
  const percentage = total === 0 ? 0 : Math.round((score / total) * 100);
  return { score, total, percentage };
}

export function computeBreakdown(questions: Question[], answers: Answer[]): Breakdown {
  const byCategory: Breakdown["byCategory"] = {};
  const byLevel: Breakdown["byLevel"] = {};

  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId);
    if (!question) continue;

    const categoryEntry = byCategory[question.category] ?? { correct: 0, total: 0 };
    categoryEntry.total += 1;
    if (answer.isCorrect) categoryEntry.correct += 1;
    byCategory[question.category] = categoryEntry;

    const levelEntry = byLevel[question.level] ?? { correct: 0, total: 0 };
    levelEntry.total += 1;
    if (answer.isCorrect) levelEntry.correct += 1;
    byLevel[question.level] = levelEntry;
  }

  return { byCategory, byLevel };
}
