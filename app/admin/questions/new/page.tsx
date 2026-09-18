"use client";

import { createQuestion } from "@/app/admin/questions/actions";
import { QuestionForm } from "@/components/admin/question-form";

export default function NewQuestionPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Nova pergunta</h1>
      <QuestionForm submitLabel="Criar pergunta" onSubmit={(values) => createQuestion(values)} />
    </div>
  );
}
