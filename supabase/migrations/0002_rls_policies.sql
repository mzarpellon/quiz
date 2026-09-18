-- Row Level Security: enable on every table, then define the narrowest
-- policies that satisfy the app's access patterns (PRD §6.2).

alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_attempt_answers enable row level security;

-- profiles: a user can only see/edit their own row. Row creation happens
-- exclusively via the handle_new_user trigger (0003), never a direct insert
-- from the app, so no insert policy is defined here.
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Belt-and-suspenders: even on their own row, a user can never flip
-- is_admin themselves via a client-side update() call. Only a service_role
-- connection (e.g. run manually via SQL/dashboard) can change it.
create function public.protect_profiles_is_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_admin is distinct from old.is_admin and auth.role() <> 'service_role' then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$;

create trigger protect_profiles_is_admin
  before update on public.profiles
  for each row
  execute function public.protect_profiles_is_admin();

-- questions: public read of active questions; admins additionally see
-- (and manage) every row, including inactive ones.
create policy "questions_select_active_public"
  on public.questions for select
  to anon, authenticated
  using (is_active = true);

create policy "questions_select_all_admin"
  on public.questions for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

create policy "questions_insert_admin"
  on public.questions for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

create policy "questions_update_admin"
  on public.questions for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

create policy "questions_delete_admin"
  on public.questions for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

-- quiz_attempts / quiz_attempt_answers: write-once, owner-only. No update
-- or delete policy is defined for either table, so those operations are
-- denied by default.
create policy "quiz_attempts_select_own"
  on public.quiz_attempts for select
  to authenticated
  using (auth.uid() = user_id);

create policy "quiz_attempts_insert_own"
  on public.quiz_attempts for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "quiz_attempt_answers_select_own"
  on public.quiz_attempt_answers for select
  to authenticated
  using (
    exists (
      select 1 from public.quiz_attempts
      where quiz_attempts.id = quiz_attempt_answers.attempt_id
        and quiz_attempts.user_id = auth.uid()
    )
  );

create policy "quiz_attempt_answers_insert_own"
  on public.quiz_attempt_answers for insert
  to authenticated
  with check (
    exists (
      select 1 from public.quiz_attempts
      where quiz_attempts.id = quiz_attempt_answers.attempt_id
        and quiz_attempts.user_id = auth.uid()
    )
  );
