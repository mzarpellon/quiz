import Link from "next/link";
import { QuestionTable } from "@/components/admin/question-table";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Perguntas</h1>
        <Button render={<Link href="/admin/questions/new" />}>Nova pergunta</Button>
      </div>
      <QuestionTable questions={questions ?? []} />
    </div>
  );
}
