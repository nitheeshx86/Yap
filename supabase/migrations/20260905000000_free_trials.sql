-- Free trials: three free report generations for a user with no active
-- entitlement, shared across every mode (Table Topics, Debate, Vocabulary).
--
-- Threat model this is built against. The client is fully untrusted: it can
-- be edited, its localStorage cleared, its requests replayed and its requests
-- fired in parallel. So:
--   * the counter lives here, not in localStorage, and is keyed to the
--     auth.users row — clearing browser state does nothing;
--   * a trial is consumed inside a `security definer` function that takes a
--     per-user advisory lock first, so the count-decide-insert sequence is a
--     critical section. Two concurrent requests cannot both see "2 used" and
--     both proceed — the second waits, re-counts, and is refused;
--   * consumption is keyed on the client's per-attempt `client_event_id`, so
--     a retry of the SAME attempt is idempotent and free, while a genuinely
--     new attempt mints a new id and costs a trial;
--   * the ledger is append-only to everyone but the service role. There is no
--     update or delete policy, and no client-writable path at all.
--
-- Additive only. Safe to paste into the Supabase Dashboard SQL editor.

-- ---------------------------------------------------------------------------
-- 1. free_trial_uses — append-only ledger, one row per consumed trial
-- ---------------------------------------------------------------------------

create table if not exists public.free_trial_uses (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  -- the per-attempt idempotency key minted by the client. Unique per user, so
  -- replaying an attempt is a no-op rather than a second charge.
  client_event_id  uuid not null,
  -- which surface spent it, for support and analytics. Never used in the cap:
  -- the three trials are shared across every mode, by design.
  kind             text not null check (kind in ('topic', 'debate', 'vocab')),
  consumed_at      timestamptz not null default now(),
  unique (user_id, client_event_id)
);

create index if not exists free_trial_uses_user_idx
  on public.free_trial_uses (user_id, consumed_at desc);

alter table public.free_trial_uses enable row level security;

-- Read-own only: the UI shows "1 of 3 free reports left". No insert, update or
-- delete policy exists, so even a stolen anon key cannot mint or erase a use;
-- only the service role (via the function below) writes here.
create policy "free_trial_uses_select_own"
  on public.free_trial_uses for select
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 2. FREE_TRIAL_LIMIT — one place to change the allowance
-- ---------------------------------------------------------------------------

create or replace function public.free_trial_limit()
returns integer
language sql
immutable
as $$ select 3 $$;

-- ---------------------------------------------------------------------------
-- 3. has_active_entitlement — shared by the checks below
-- ---------------------------------------------------------------------------

create or replace function public.has_active_entitlement(p_user_id uuid, p_product text default 'pro')
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.entitlements
    where user_id = p_user_id
      and product = p_product
      and status = 'active'
      and (expires_at is null or expires_at > now())
  )
$$;

-- ---------------------------------------------------------------------------
-- 4. consume_free_trial — the atomic gate
-- ---------------------------------------------------------------------------
-- Returns the access decision AND the resulting balance in one round trip.
-- `allowed` is the only field a caller should branch on.
--
--   entitled  -> allowed, nothing consumed, trials untouched
--   replay    -> allowed, nothing consumed (this attempt already paid)
--   consumed  -> allowed, one trial spent
--   exhausted -> denied
--
-- The race is closed by the INSERT ... on conflict do nothing + the count
-- being taken INSIDE the same statement's snapshot: N parallel calls with N
-- distinct event ids serialise on the unique index, and any that would push
-- the total past the limit insert nothing and come back exhausted.

create or replace function public.consume_free_trial(
  p_user_id uuid,
  p_client_event_id uuid,
  p_kind text
)
returns table (
  allowed boolean,
  reason text,
  used integer,
  remaining integer,
  limit_total integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit integer := public.free_trial_limit();
  v_entitled boolean;
  v_rows integer := 0;
  v_existing boolean;
  v_used integer;
begin
  if p_kind is null or p_kind not in ('topic', 'debate', 'vocab') then
    raise exception 'invalid kind: %', p_kind using errcode = '22023';
  end if;

  -- Serialise every trial decision for THIS user. Without it the cap leaks:
  -- under READ COMMITTED (the default) the count below is taken from the
  -- statement's snapshot, so N requests fired in parallel at used = 2 would
  -- each independently see "2 < 3" and each insert a row — the classic
  -- check-then-act race, and the exact move an attacker would make to turn
  -- 3 free reports into 30. A transaction-scoped advisory lock makes the
  -- read-decide-write sequence one critical section per user; it is released
  -- automatically at commit or rollback, and it only ever contends with the
  -- same user's own concurrent requests.
  perform pg_advisory_xact_lock(hashtext('yap:free_trial:' || p_user_id::text));

  -- Paid users never touch the ledger, so an entitlement bought mid-session
  -- immediately stops spending trials and the unused ones stay banked.
  v_entitled := public.has_active_entitlement(p_user_id, 'pro');
  select count(*)::integer into v_used
  from public.free_trial_uses where user_id = p_user_id;

  if v_entitled then
    return query select true, 'entitled'::text, v_used, greatest(v_limit - v_used, 0), v_limit;
    return;
  end if;

  -- Already paid for by this exact attempt? Free retry.
  select exists (
    select 1 from public.free_trial_uses
    where user_id = p_user_id and client_event_id = p_client_event_id
  ) into v_existing;

  if v_existing then
    return query select true, 'replay'::text, v_used, greatest(v_limit - v_used, 0), v_limit;
    return;
  end if;

  -- The gate itself. Safe to read-then-write because the advisory lock above
  -- means no other request for this user can be between these two statements.
  -- The unique constraint stays as a second line of defence (and makes a
  -- same-event-id double submit a no-op rather than a double charge).
  insert into public.free_trial_uses (user_id, client_event_id, kind)
  select p_user_id, p_client_event_id, p_kind
  where v_used < v_limit
  on conflict (user_id, client_event_id) do nothing;

  get diagnostics v_rows = row_count;

  select count(*)::integer into v_used
  from public.free_trial_uses where user_id = p_user_id;

  if v_rows > 0 then
    return query select true, 'consumed'::text, v_used, greatest(v_limit - v_used, 0), v_limit;
  else
    -- Either the cap is full, or a concurrent request with the same event id
    -- won the insert. Re-check the latter so a double-submit of one attempt
    -- is still treated as allowed rather than as a denial.
    select exists (
      select 1 from public.free_trial_uses
      where user_id = p_user_id and client_event_id = p_client_event_id
    ) into v_existing;

    if v_existing then
      return query select true, 'replay'::text, v_used, greatest(v_limit - v_used, 0), v_limit;
    else
      return query select false, 'exhausted'::text, v_used, 0, v_limit;
    end if;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. get_access_state — a read-only peek, for hydrating the UI
-- ---------------------------------------------------------------------------
-- Never consumes. The client uses this to render "2 free reports left" and to
-- decide whether to show the paywall BEFORE a recording starts. It is a
-- courtesy, not a gate: the real decision is always consume_free_trial().

create or replace function public.get_access_state(p_user_id uuid)
returns table (
  entitled boolean,
  used integer,
  remaining integer,
  limit_total integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    public.has_active_entitlement(p_user_id, 'pro'),
    (select count(*)::integer from public.free_trial_uses where user_id = p_user_id),
    greatest(
      public.free_trial_limit()
        - (select count(*)::integer from public.free_trial_uses where user_id = p_user_id),
      0
    ),
    public.free_trial_limit()
$$;

-- Only the service role calls these; the client goes through /api routes.
revoke execute on function public.consume_free_trial(uuid, uuid, text) from public, anon, authenticated;
revoke execute on function public.get_access_state(uuid) from public, anon;
