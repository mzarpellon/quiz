import { ResultScreen } from "@/components/quiz/result-screen";
import { createClient } from "@/lib/supabase/server";

export default async function ResultadoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <ResultScreen loggedIn={!!user} />
    </div>
  );
}
