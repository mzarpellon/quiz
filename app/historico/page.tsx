import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { Breakdown, Category } from "@/lib/quiz/engine";

const CATEGORY_LABELS: Record<Category, string> = {
  negocio: "Negócio",
  cli_basico: "CLI básico",
  avancado: "Avançado",
};

export default async function HistoricoPage() {
  const supabase = await createClient();
  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("id, score, total_questions, breakdown, started_at")
    .order("started_at", { ascending: false });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-8">
      <h1 className="text-xl font-semibold">Meu histórico</h1>
      {!attempts || attempts.length === 0 ? (
        <p className="text-sm text-muted-foreground">Você ainda não jogou nenhuma partida.</p>
      ) : (
        attempts.map((attempt) => {
          const breakdown = attempt.breakdown as unknown as Breakdown;
          return (
            <Card key={attempt.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {new Date(attempt.started_at).toLocaleDateString("pt-BR")} — {attempt.score}/
                  {attempt.total_questions}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {Object.entries(breakdown.byCategory).map(([category, entry]) => (
                    <span key={category}>
                      {CATEGORY_LABELS[category as Category]}: {entry.correct}/{entry.total}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
