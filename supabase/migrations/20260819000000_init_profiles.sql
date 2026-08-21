-- Minimal Yap backend: one row per user for streak + plan state.
-- No transcripts, results, or analysis are ever stored server-side.

create table public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  email          text,
  streak         integer not null default 0,
  last_active_date date,
  plan           text not null default 'free' check (plan in ('free', 'paid')),
  plan_expires_at timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read only their own row.
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- Users can update only their own row...
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ...and even then, only the streak/last_active_date columns: plan and
-- plan_expires_at must only ever be changed by the service role (e.g. from
-- a payment webhook), never by the signed-in user directly.
revoke update on public.profiles from authenticated;
grant update (streak, last_active_date) on public.profiles to authenticated;

-- No insert/delete policies for regular users: rows are created only by the
-- trigger below, and removed automatically via the auth.users FK cascade.

-- Keep updated_at current on every change.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row the moment someone signs up (any provider,
-- including Google OAuth).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
