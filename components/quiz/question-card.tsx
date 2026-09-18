"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { Question } from "@/lib/quiz/engine";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<Question["category"], string> = {
  negocio: "Negócio",
  cli_basico: "CLI básico",
  avancado: "Avançado",
};

const LEVEL_LABELS: Record<Question["level"], string> = {
  basico: "Básico",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

type Props = {
  question: Question;
  progress: string;
  revealed: boolean;
  userAnswer: boolean | null;
  isLast: boolean;
  onAnswer: (answer: boolean) => void;
  onNext: () => void;
};

export function QuestionCard({
  question,
  progress,
  revealed,
  userAnswer,
  isLast,
  onAnswer,
  onNext,
}: Props) {
  const isCorrect = revealed && userAnswer === question.correctAnswer;

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>{progress}</span>
          <div className="flex gap-2">
            <Badge variant="secondary">{CATEGORY_LABELS[question.category]}</Badge>
            <Badge variant="outline">{LEVEL_LABELS[question.level]}</Badge>
          </div>
        </div>
        <p className="text-lg font-medium">{question.statement}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            className="h-12 flex-1"
            variant={revealed && question.correctAnswer === true ? "default" : "outline"}
            disabled={revealed}
            onClick={() => onAnswer(true)}
          >
            Verdadeiro
          </Button>
          <Button
            size="lg"
            className="h-12 flex-1"
            variant={revealed && question.correctAnswer === false ? "default" : "outline"}
            disabled={revealed}
            onClick={() => onAnswer(false)}
          >
            Falso
          </Button>
        </div>
        {revealed && (
          <div
            className={cn(
              "rounded-md border p-4 text-sm",
              isCorrect ? "border-green-200 bg-green-50 text-green-900" : "border-red-200 bg-red-50 text-red-900",
            )}
          >
            <p className="font-semibold">{isCorrect ? "Você acertou!" : "Você errou."}</p>
            <p className="mt-1 text-foreground">{question.explanation}</p>
          </div>
        )}
      </CardContent>
      {revealed && (
        <CardFooter>
          <Button className="w-full" onClick={onNext}>
            {isLast ? "Ver resultado" : "Próxima"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
