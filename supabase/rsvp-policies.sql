-- ============================================================
--  RSVP security for rsvp_responses (Row Level Security)
--
--  WHERE TO PASTE: Supabase Dashboard → SQL Editor → New query
--  → paste this WHOLE file → Run.
--
--  Model:
--   • Guests (anon key) may ONLY insert responses.
--   • Guests can never read, update or delete anything.
--   • Admins are Supabase Auth users listed in wedding_admins,
--     and can read/update/delete ONLY their own wedding_id.
-- ============================================================

-- ---------- 0. Safety: make sure RLS is on (idempotent) ----------
alter table public.rsvp_responses enable row level security;

-- ---------- 1. Admin mapping table (multi-tenant) ----------
-- Each row says: "this auth user administers this wedding_id".
create table if not exists public.wedding_admins (
  user_id    uuid not null references auth.users (id) on delete cascade,
  wedding_id text not null,
  primary key (user_id, wedding_id)
);

alter table public.wedding_admins enable row level security;

-- Admins may see their own mapping rows (needed for the dashboard).
drop policy if exists "admins read own mapping" on public.wedding_admins;
create policy "admins read own mapping"
  on public.wedding_admins
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Nobody can write to wedding_admins from the client.
-- (No insert/update/delete policies = denied. You add admins from the
--  SQL editor with the service role — see step 3 below.)

-- ---------- 2. Policies on rsvp_responses ----------

-- 2a. Guests can INSERT a response (with sanity limits).
drop policy if exists "guests can insert rsvp" on public.rsvp_responses;
create policy "guests can insert rsvp"
  on public.rsvp_responses
  for insert
  to anon, authenticated
  with check (
    char_length(coalesce(guest_name, ''))  between 1 and 120
    and char_length(coalesce(message, '')) <= 1000
    and guest_count between 0 and 20
    and attendance_status in ('yes', 'no')
    and language in ('fr', 'ar')
    and char_length(coalesce(wedding_id, '')) between 1 and 80
  );

-- 2b. NO select/update/delete policy for anon:
--     with RLS enabled, no policy = access denied. Nothing to add.

-- 2c. Admins can READ responses of their own wedding only.
drop policy if exists "admins read own wedding" on public.rsvp_responses;
create policy "admins read own wedding"
  on public.rsvp_responses
  for select
  to authenticated
  using (
    exists (
      select 1 from public.wedding_admins wa
      where wa.user_id = (select auth.uid())
        and wa.wedding_id = rsvp_responses.wedding_id
    )
  );

-- 2d. Admins can UPDATE responses of their own wedding only.
drop policy if exists "admins update own wedding" on public.rsvp_responses;
create policy "admins update own wedding"
  on public.rsvp_responses
  for update
  to authenticated
  using (
    exists (
      select 1 from public.wedding_admins wa
      where wa.user_id = (select auth.uid())
        and wa.wedding_id = rsvp_responses.wedding_id
    )
  )
  with check (
    exists (
      select 1 from public.wedding_admins wa
      where wa.user_id = (select auth.uid())
        and wa.wedding_id = rsvp_responses.wedding_id
    )
  );

-- 2e. Admins can DELETE responses of their own wedding only.
drop policy if exists "admins delete own wedding" on public.rsvp_responses;
create policy "admins delete own wedding"
  on public.rsvp_responses
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.wedding_admins wa
      where wa.user_id = (select auth.uid())
        and wa.wedding_id = rsvp_responses.wedding_id
    )
  );

-- ---------- 3. Add an admin (run once per client) ----------
-- First create the user in Dashboard → Authentication → Users → Add user
-- (email + password). Then link them to their wedding:
--
--   insert into public.wedding_admins (user_id, wedding_id)
--   values (
--     (select id from auth.users where email = 'client@example.com'),
--     'amine-fatima-2026'   -- must match "wedding.id" in wedding-config.json
--   );

-- ---------- 4. Recommended hardening (optional but wise) ----------
-- Sensible defaults + belt-and-braces constraints at the table level:
alter table public.rsvp_responses
  alter column created_at set default now();
-- Uncomment if these constraints don't exist yet:
-- alter table public.rsvp_responses
--   add constraint rsvp_guest_count_range check (guest_count between 0 and 20),
--   add constraint rsvp_attendance_values check (attendance_status in ('yes','no'));
