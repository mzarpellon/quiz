<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Guidance for this repository

`prd.md` is the full product spec (in Portuguese) and is the source of truth for scope and behavior. Read it before implementing any feature — the summary below only covers the architecture decisions needed to start coding productively; it does not replace reading the PRD for functional detail (screen flows, acceptance criteria, copy tone, etc). An implementation plan derived from the PRD lives at `/home/mzarpellon/.claude/plans/elaborar-plano-de-desenvolvimento-bright-karp.md`.

## What this is

A single-page-per-round "Verdadeiro ou Falso" (True/False) quiz web app about Claude Code / the Claude Agent SDK, built as a portfolio piece. A player answers a shuffled subset of questions drawn from a larger question bank, gets an explanation after each answer, and sees a final score breakdown by category and difficulty. Logged-in players get their match history saved; a single admin user manages the question bank through a `/admin` panel with no redeploy required.

## Locked-in architecture decisions

- **Framework:** Next.js (App Router) + TypeScript, scaffolded with `create-next-app`, `--src-dir=false` (app/components/lib live at repo root).
- **Package manager:** pnpm (installed via corepack; Node itself is managed via nvm in this environment since it wasn't preinstalled).
- **Styling:** Tailwind CSS, Anthropic-inspired light theme (terracotta `#CC785C` accent, cream/beige background, no pure dark mode). shadcn/ui provides the component primitives (Button, Card, Badge, Form, etc.) on top of Tailwind.
- **Backend:** Supabase (Postgres + Auth) — no separate backend service. All persisted data (questions, quiz attempts, profiles) lives in Supabase; question content is editable via the admin panel with changes reflected live in the game (no redeploy). Schema is managed via versioned SQL migrations in `supabase/migrations/`, applied with the Supabase CLI (`supabase db push`) directly against a single hosted Supabase project (no local Docker stack — dev and prod share one project, consistent with this being a solo portfolio project).
- **Auth method:** magic link (passwordless), not email+password.
- **Hosting:** Vercel (chosen specifically because Auth + dynamic Supabase reads/writes rule out a fully static host like GitHub Pages).
- **No `localStorage` for critical data** — only permissible for non-critical UI conveniences (e.g. "seen tutorial" flags). All match results and history must go through Supabase.
- **Language:** all UI copy and content is PT-BR only (no i18n in MVP).
- **Testing:** deliberately light — vitest unit tests only for the pure score/breakdown logic in `lib/quiz/engine.ts`; no e2e suite for this portfolio-scale project.

## Data model (Supabase / Postgres)

Four tables, defined in full in `prd.md` §6.1:

- **`profiles`** — mirrors `auth.users`, adds `is_admin boolean`. `is_admin` is only ever set manually via SQL/Supabase dashboard, never through the app; a DB trigger blocks the app from changing it via a user-facing update.
- **`questions`** — `statement`, `correct_answer` (bool), `explanation`, `category` (`negocio`|`cli_basico`|`avancado`), `level` (`basico`|`intermediario`|`avancado`), `is_active` (soft delete/disable). Use `check` constraints for category/level, not Postgres `ENUM`, since new categories are expected later (PRD §12).
- **`quiz_attempts`** — one row per finished match: `user_id`, `score`, `total_questions`, `breakdown` (jsonb, per-category/level correct-vs-total).
- **`quiz_attempt_answers`** (optional/secondary) — per-question answer granularity for future analysis.
- A `get_random_questions(question_count int)` RPC function does the "pick N active questions at random" sampling server-side (`order by random() limit n` is fast enough at this table size) rather than exposing the full question bank to the client.

### RLS rules (must be enforced at the Postgres level, not just in app code)

- `questions`: public `SELECT` (anon + authenticated) restricted to `is_active = true`; admins additionally get an unrestricted `SELECT` (to manage inactive rows); `INSERT`/`UPDATE`/`DELETE` restricted to `is_admin = true`.
- `quiz_attempts` / `quiz_attempt_answers`: `INSERT`/`SELECT` restricted to rows where `user_id = auth.uid()` (the latter via a join since it has no direct `user_id` column). Write-once — no `UPDATE`/`DELETE` policies.
- `profiles`: a user can only read/edit their own row.
- The "no admin access" acceptance criterion must hold even via direct API calls, not just hidden UI — this is validated by RLS, not by client-side route guards alone. Route/layout-level checks (e.g. `app/admin/layout.tsx`) exist only for clean UX (redirect instead of a raw Postgres error), never as the actual security boundary.

## Key routes (from PRD §8)

| Route | Purpose |
|---|---|
| `/` | Home, quiz description, "Jogar" CTA |
| `/login` | Magic link auth via Supabase (`signInWithOtp`) |
| `/jogar` | One question at a time, progress indicator, immediate feedback + explanation |
| `/resultado` | Final score, breakdown by category/level, "Jogar novamente" / "Ver meu histórico" |
| `/historico` | Past attempts list, logged-in only |
| `/admin` | Question CRUD, `is_admin = true` only; must 403/redirect otherwise |

## Explicit non-goals for MVP (see PRD §2 "Fora de escopo")

Do not build these unless asked — they are deliberately deferred to V2: public leaderboard, per-question timer, social sharing of results, multi-language support, adaptive difficulty, and an "SDK e integrações" question category.

## Game logic notes

- A match samples 10–15 questions from a pool of ~20–30 active questions, order shuffled, questions from all categories/levels interleaved (not sequential phases).
- Scoring is simple: 1 point per correct answer, 0 otherwise — no timer, no penalties.
- Anonymous players can play fully but their results are never persisted, only shown for the current session.
- The initial seed must cover all 3 categories and all 3 levels with at least 20 active questions (see PRD §10 for example question format/tone). Authoring this seed content is real writing/fact-checking work, not just SQL plumbing.
- `lib/quiz/engine.ts` holds the pure, framework-agnostic score/breakdown calculation logic — reused by both the anonymous (no persistence) and authenticated (persist to `quiz_attempts`) paths, which only branch at "save or don't."
