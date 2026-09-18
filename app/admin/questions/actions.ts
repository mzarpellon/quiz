"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { questionSchema } from "@/lib/quiz/question-schema";

// RLS is the actual enforcement boundary (a non-admin's write is rejected
// by Postgres regardless of this check). This check exists only so the
// admin UI gets a clean error message instead of a raw RLS violation.
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, isAdmin: false as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return { supabase, isAdmin: profile?.is_admin === true };
}

function toRow(data: ReturnType<typeof questionSchema.parse>) {
  return {
    statement: data.statement,
    correct_answer: data.correctAnswer,
    explanation: data.explanation,
    category: data.category,
    level: data.level,
    is_active: data.isActive,
  };
}

export async function createQuestion(input: unknown) {
  const parsed = questionSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Dados inválidos." };

  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false as const, error: "Acesso restrito a administradores." };

  const { error } = await supabase.from("questions").insert(toRow(parsed.data));
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin");
  return { ok: true as const };
}

export async function updateQuestion(id: string, input: unknown) {
  const parsed = questionSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Dados inválidos." };

  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false as const, error: "Acesso restrito a administradores." };

  const { error } = await supabase.from("questions").update(toRow(parsed.data)).eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin");
  return { ok: true as const };
}

export async function deleteQuestion(id: string) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false as const, error: "Acesso restrito a administradores." };

  const { error } = await supabase.from("questions").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin");
  return { ok: true as const };
}

export async function toggleActive(id: string, isActive: boolean) {
  const { supabase, isAdmin } = await requireAdmin();
  if (!isAdmin) return { ok: false as const, error: "Acesso restrito a administradores." };

  const { error } = await supabase.from("questions").update({ is_active: isActive }).eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  revalidatePath("/admin");
  return { ok: true as const };
}
