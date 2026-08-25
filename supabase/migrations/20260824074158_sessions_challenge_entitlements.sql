-- Sessions, 7-Day Island Challenge, payments and entitlements.
--
-- Product-policy note (call out for the owner to confirm): the original
-- schema's comment said "No transcripts, results, or analysis are ever
-- stored server-side." `practice_sessions` below stores metadata only —
-- duration, xp, an optional topic string, and an optional overall score —
-- never a transcript, never raw analysis text. This is a deliberate,
-- narrow widening of that policy, required so the streak and challenge can
-- be computed server-side instead of trusted from the client. No transcript
-- or free-text AI output is stored anywhere in this migration.
--
-- Additive only. Does not modify 20260819000000_init_profiles.sql.
-- Safe to paste directly into the Supabase Dashboard SQL editor.

-- ---------------------------------------------------------------------------
-- 1. profiles: new columns (all nullable/defaulted, existing rows stay valid)
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists timezone text not null default 'Asia/Kolkata',
  add column if not exists display_name text,
  add column if not exists onboarding_done boolean not null default false,
  add column if not exists goal text,
  add column if not exists total_xp int not null default 0,
  add column if not exists total_reps int not null default 0,
  add column if not exists total_seconds int not null default 0,
  add column if not exists streak_updated_at timestamptz;

-- streak / last_active_date become a server-only derived cache: the client
-- may no longer write them directly. Re-grant only genuinely self-editable
-- columns.
revoke update on public.profiles from authenticated;
grant update (timezone, display_name, onboarding_done, goal) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- 2. practice_sessions — the authoritative activity event
-- ---------------------------------------------------------------------------

create table if not exists public.practice_sessions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  kind              text not null check (kind in ('topic', 'debate', 'vocab')),
  completed_at      timestamptz not null default now(),
  local_date        date not null,
  duration_seconds  int not null check (duration_seconds >= 0),
  xp_awarded        int not null default 0 check (xp_awarded >= 0),
  topic             text,
  overall_score     int,
  client_event_id   uuid not null,
  created_at        timestamptz not null default now(),
  unique (user_id, client_event_id)
);

create index if not exists practice_sessions_user_date_idx
  on public.practice_sessions (user_id, local_date desc);
create index if not exists practice_sessions_user_kind_date_idx
  on public.practice_sessions (user_id, kind, local_date desc);

alter table public.practice_sessions enable row level security;

create policy "practice_sessions_select_own"
  on public.practice_sessions for select
  to authenticated
  using (auth.uid() = user_id);

-- No insert/update/delete policy for `authenticated`: sessions are written
-- only by the SECURITY DEFINER function below (service role / definer
-- context), so the client cannot post a session or a streak directly.

-- ---------------------------------------------------------------------------
-- 3. challenge_enrollments — the 7-Day Island Challenge
-- ---------------------------------------------------------------------------

create table if not exists public.challenge_enrollments (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  challenge_key text not null default 'island_7',
  started_on    date not null,
  target_days   int not null default 7,
  status        text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- one active enrolment per user per challenge
create unique index if not exists challenge_enrollments_active_uidx
  on public.challenge_enrollments (user_id, challenge_key)
  where status = 'active';

alter table public.challenge_enrollments enable row level security;

create policy "challenge_enrollments_select_own"
  on public.challenge_enrollments for select
  to authenticated
  using (auth.uid() = user_id);

create trigger challenge_enrollments_set_updated_at
  before update on public.challenge_enrollments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. challenge_day_completions — which challenge days are done
-- ---------------------------------------------------------------------------

create table if not exists public.challenge_day_completions (
  id             uuid primary key default gen_random_uuid(),
  enrollment_id  uuid not null references public.challenge_enrollments (id) on delete cascade,
  user_id        uuid not null,
  day_number     int not null check (day_number between 1 and 31),
  session_id     uuid references public.practice_sessions (id) on delete set null,
  local_date     date not null,
  completed_at   timestamptz not null default now(),
  unique (enrollment_id, day_number),
  unique (enrollment_id, local_date)
);

alter table public.challenge_day_completions enable row level security;

create policy "challenge_day_completions_select_own"
  on public.challenge_day_completions for select
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 5. payments — every Razorpay event, for idempotency and audit
-- ---------------------------------------------------------------------------

create table if not exists public.payments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users (id) on delete set null,
  razorpay_order_id   text not null,
  razorpay_payment_id text unique,
  plan_key            text not null,
  months              int not null,
  amount_paise        int not null,
  currency            text not null default 'INR',
  status              text not null check (status in ('created', 'captured', 'failed', 'refunded')),
  verified_via        text check (verified_via in ('handler', 'webhook')),
  raw                 jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists payments_user_created_idx
  on public.payments (user_id, created_at desc);
create unique index if not exists payments_order_created_uidx
  on public.payments (razorpay_order_id)
  where status = 'created';

alter table public.payments enable row level security;

create policy "payments_select_own"
  on public.payments for select
  to authenticated
  using (auth.uid() = user_id);

-- No write policy: payments are only ever written by the service role
-- (verify-payment / webhook routes).

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 6. entitlements — the authoritative "may this user use paid features" table
-- ---------------------------------------------------------------------------

create table if not exists public.entitlements (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  product     text not null default 'pro',
  source      text not null default 'razorpay',
  starts_at   timestamptz not null default now(),
  expires_at  timestamptz,
  status      text not null check (status in ('active', 'expired', 'cancelled')),
  payment_id  uuid references public.payments (id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, product)
);

alter table public.entitlements enable row level security;

create policy "entitlements_select_own"
  on public.entitlements for select
  to authenticated
  using (auth.uid() = user_id);

-- No write policy: entitlements are only ever written by the service role.

create trigger entitlements_set_updated_at
  before update on public.entitlements
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 7. recompute_streak(user_id) — derivation wins over the cached column
-- ---------------------------------------------------------------------------

create or replace function public.recompute_streak(p_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_streak integer := 0;
  v_cursor date;
  v_today date;
  v_dates date[];
  v_d date;
  v_expected date;
  v_i integer;
begin
  -- distinct local_date values with at least one qualifying 'topic' session,
  -- newest first. Qualification (wc >= 15, intelligible) is enforced by the
  -- caller (complete_practice_session) before a row is ever inserted.
  select array_agg(distinct local_date order by local_date desc)
  into v_dates
  from public.practice_sessions
  where user_id = p_user_id and kind = 'topic';

  if v_dates is null or array_length(v_dates, 1) is null then
    update public.profiles
    set streak = 0, last_active_date = null, streak_updated_at = now()
    where id = p_user_id;
    return 0;
  end if;

  v_today := (now() at time zone coalesce(
    (select timezone from public.profiles where id = p_user_id), 'Asia/Kolkata'
  ))::date;

  -- newest qualifying date must be today or yesterday, or the streak is 0
  v_cursor := v_dates[1];
  if v_cursor < v_today - 1 then
    update public.profiles
    set streak = 0, last_active_date = v_cursor, streak_updated_at = now()
    where id = p_user_id;
    return 0;
  end if;

  v_streak := 1;
  v_expected := v_cursor - 1;
  for v_i in 2..array_length(v_dates, 1) loop
    v_d := v_dates[v_i];
    if v_d = v_expected then
      v_streak := v_streak + 1;
      v_expected := v_d - 1;
    else
      exit;
    end if;
  end loop;

  update public.profiles
  set streak = v_streak, last_active_date = v_cursor, streak_updated_at = now()
  where id = p_user_id;

  return v_streak;
end;
$$;

-- ---------------------------------------------------------------------------
-- 8. complete_practice_session — atomic: session + challenge day + streak
-- ---------------------------------------------------------------------------

create or replace function public.complete_practice_session(
  p_user_id uuid,
  p_kind text,
  p_duration_seconds int,
  p_xp int,
  p_topic text,
  p_overall_score int,
  p_client_event_id uuid,
  p_local_date date
)
returns table (
  session_id uuid,
  inserted boolean,
  streak integer,
  challenge_day integer,
  challenge_status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session_id uuid;
  v_inserted boolean := false;
  v_enrollment record;
  v_day_number integer;
  v_streak integer;
begin
  -- idempotent upsert on (user_id, client_event_id)
  insert into public.practice_sessions
    (user_id, kind, local_date, duration_seconds, xp_awarded, topic, overall_score, client_event_id)
  values
    (p_user_id, p_kind, p_local_date, p_duration_seconds, p_xp, p_topic, p_overall_score, p_client_event_id)
  on conflict (user_id, client_event_id) do nothing
  returning id into v_session_id;

  if v_session_id is not null then
    v_inserted := true;
  else
    select id into v_session_id
    from public.practice_sessions
    where user_id = p_user_id and client_event_id = p_client_event_id;
  end if;

  -- update denormalised totals only on a genuinely new row
  if v_inserted then
    update public.profiles
    set total_xp = total_xp + greatest(p_xp, 0),
        total_reps = total_reps + 1,
        total_seconds = total_seconds + greatest(p_duration_seconds, 0)
    where id = p_user_id;
  end if;

  -- advance the active challenge enrolment, topic sessions only
  if v_inserted and p_kind = 'topic' then
    select * into v_enrollment
    from public.challenge_enrollments
    where user_id = p_user_id and status = 'active'
    limit 1;

    if v_enrollment.id is not null then
      v_day_number := (p_local_date - v_enrollment.started_on) + 1;
      if v_day_number >= 1 and v_day_number <= v_enrollment.target_days
         and not exists (
           select 1 from public.challenge_day_completions
           where enrollment_id = v_enrollment.id
             and (day_number = v_day_number or local_date = p_local_date)
         )
      then
        insert into public.challenge_day_completions
          (enrollment_id, user_id, day_number, session_id, local_date)
        values
          (v_enrollment.id, p_user_id, v_day_number, v_session_id, p_local_date)
        on conflict do nothing;
      end if;

      -- mark the enrolment completed once every target day is filled
      if (select count(*) from public.challenge_day_completions where enrollment_id = v_enrollment.id) >= v_enrollment.target_days then
        update public.challenge_enrollments
        set status = 'completed', completed_at = now()
        where id = v_enrollment.id;
      end if;
    end if;
  end if;

  -- streak is derived, never incremented by hand
  v_streak := public.recompute_streak(p_user_id);

  -- report progress on the most recently created enrolment (active or just
  -- completed by this call), so the client always has something to show
  declare
    v_latest_enrollment_id uuid;
    v_latest_status text;
    v_day_count integer;
  begin
    select id, status into v_latest_enrollment_id, v_latest_status
    from public.challenge_enrollments
    where user_id = p_user_id
    order by created_at desc
    limit 1;

    if v_latest_enrollment_id is not null then
      select count(*)::integer into v_day_count
      from public.challenge_day_completions
      where enrollment_id = v_latest_enrollment_id;
    else
      v_day_count := 0;
    end if;

    return query select v_session_id, v_inserted, v_streak, v_day_count, v_latest_status;
  end;
end;
$$;

-- ---------------------------------------------------------------------------
-- 9. start_challenge / abandon_challenge — idempotent, never delete history
-- ---------------------------------------------------------------------------

create or replace function public.start_challenge(p_user_id uuid, p_local_date date)
returns public.challenge_enrollments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.challenge_enrollments;
begin
  select * into v_row
  from public.challenge_enrollments
  where user_id = p_user_id and challenge_key = 'island_7' and status = 'active'
  limit 1;

  if v_row.id is not null then
    return v_row;
  end if;

  insert into public.challenge_enrollments (user_id, challenge_key, started_on, target_days, status)
  values (p_user_id, 'island_7', p_local_date, 7, 'active')
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.abandon_challenge(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.challenge_enrollments
  set status = 'abandoned', updated_at = now()
  where user_id = p_user_id and challenge_key = 'island_7' and status = 'active';
end;
$$;

-- ---------------------------------------------------------------------------
-- 10. grant execute on the RPC functions to authenticated (RLS inside still
--     restricts each call to p_user_id = the caller, enforced by the route
--     handler which always passes auth.uid(), never a client-supplied id)
-- ---------------------------------------------------------------------------

grant execute on function public.recompute_streak(uuid) to authenticated;
grant execute on function public.complete_practice_session(uuid, text, int, int, text, int, uuid, date) to authenticated;
grant execute on function public.start_challenge(uuid, date) to authenticated;
grant execute on function public.abandon_challenge(uuid) to authenticated;
