-- Onboarding answers.
--
-- The onboarding flow asks two short questions (why you're here, what gets in
-- the way). `profiles.goal` from the previous migration is a single text
-- column and cannot hold either answer, so the arrays live in their own
-- columns. `goal` is kept and now stores the *primary* goal — the first pick —
-- so anything already reading it keeps working.
--
-- Additive only. Safe to paste into the Supabase Dashboard SQL editor.

alter table public.profiles
  add column if not exists goals text[] not null default '{}',
  add column if not exists blocks text[] not null default '{}',
  add column if not exists onboarded_at timestamptz;

-- Onboarding is written through /api/me/onboarding (service role), not from
-- the browser, so the client keeps only the grants it already had. Re-stating
-- the grant list here keeps it authoritative in one place after this file
-- runs; note `goals`/`blocks`/`onboarded_at` are deliberately absent.
revoke update on public.profiles from authenticated;
grant update (timezone, display_name) on public.profiles to authenticated;
