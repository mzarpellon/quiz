"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuizResult } from "@/components/quiz/quiz-result-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Category, Level } from "@/lib/quiz/engine";

const CATEGORY_LABELS: Record<Category, string> = {
  negocio: "Negócio",
  cli_basico: "CLI básico",
  avancado: "Avançado",
};

const LEVEL_LABELS: Record<Level, string> = {
  basico: "Básico",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export function ResultScreen({ loggedIn }: { loggedIn: boolean }) {
  const { result, setResult } = useQuizResult();
  const router = useRouter();

  if (!result) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Nenhum resultado recente</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Não encontramos um resultado desta sessão. Que tal jogar uma partida?
          </p>
          <Button render={<Link href="/jogar" />}>Jogar</Button>
        </CardContent>
      </Card>
    );
  }

  function playAgain() {
    setResult(null);
    router.push("/jogar");
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          Resultado: {result.score}/{result.total} ({result.percentage}%)
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Por categoria</p>
          {Object.entries(result.breakdown.byCategory).map(([category, entry]) => (
            <div key={category} className="flex justify-between text-sm">
              <span>{CATEGORY_LABELS[category as Category]}</span>
              <span>
                {entry.correct}/{entry.total}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Por nível</p>
          {Object.entries(result.breakdown.byLevel).map(([level, entry]) => (
            <div key={level} className="flex justify-between text-sm">
              <span>{LEVEL_LABELS[level as Level]}</span>
              <span>
                {entry.correct}/{entry.total}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" onClick={playAgain}>
            Jogar novamente
          </Button>
          {loggedIn && (
            <Button variant="outline" className="flex-1" render={<Link href="/historico" />}>
              Ver meu histórico
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
