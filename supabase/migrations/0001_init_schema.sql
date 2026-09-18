-- Core schema: profiles, questions, quiz_attempts, quiz_attempt_answers.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  statement text not null,
  correct_answer boolean not null,
  explanation text not null,
  category text not null check (category in ('negocio', 'cli_basico', 'avancado')),
  level text not null check (level in ('basico', 'intermediario', 'avancado')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  score int not null,
  total_questions int not null,
  breakdown jsonb not null,
  started_at timestamptz not null,
  finished_at timestamptz not null default now()
);

create table public.quiz_attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete restrict,
  user_answer boolean not null,
  is_correct boolean not null
);

-- Indexes for the queries this app actually runs.
create index questions_is_active_category_level_idx
  on public.questions (is_active, category, level);

create index quiz_attempts_user_id_started_at_idx
  on public.quiz_attempts (user_id, started_at desc);

create index quiz_attempt_answers_attempt_id_idx
  on public.quiz_attempt_answers (attempt_id);

-- Keep questions.updated_at accurate on admin edits.
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_questions_updated_at
  before update on public.questions
  for each row
  execute function public.set_updated_at();
