import { notFound } from "next/navigation";
import { updateQuestion } from "@/app/admin/questions/actions";
import { QuestionForm } from "@/components/admin/question-form";
import type { QuestionFormValues } from "@/lib/quiz/question-schema";
import { createClient } from "@/lib/supabase/server";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: question } = await supabase.from("questions").select("*").eq("id", id).single();

  if (!question) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Editar pergunta</h1>
      <QuestionForm
        submitLabel="Salvar alterações"
        defaultValues={{
          statement: question.statement,
          correctAnswer: question.correct_answer,
          explanation: question.explanation,
          category: question.category as QuestionFormValues["category"],
          level: question.level as QuestionFormValues["level"],
          isActive: question.is_active,
        }}
        onSubmit={updateQuestion.bind(null, question.id)}
      />
    </div>
  );
}
