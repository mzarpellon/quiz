-- Server-side sampling: picks a random subset of active questions without
-- exposing the full question bank to the client. At this table size
-- (~20-30 rows) `order by random()` is fast enough; no need for more
-- elaborate sampling strategies.

create function public.get_random_questions(question_count int default 12)
returns setof public.questions
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.questions
  where is_active = true
  order by random()
  limit question_count;
$$;

grant execute on function public.get_random_questions(int) to anon, authenticated;
