-- ============================================================
--  COMPANIONS MIGRATION — RSVP companions system
--
--  WHERE TO PASTE: Supabase Dashboard → SQL Editor → New query
--  → paste this WHOLE file → Run. (Idempotent: safe to re-run.)
--
--  Adds:
--   • rsvp_responses: adult_count / child_count / total_guests /
--     companions (jsonb array of {name, type}).
--   • weddings.rsvp_settings: per-wedding companion rules
--     {allow_companions, max_companions, children_allowed}.
--   • Backfills legacy RSVP rows from guest_count (all adults).
--   • Refreshes the guest INSERT policy to validate the new columns.
--
--  Run this BEFORE deploying the companions code.
-- ============================================================

-- ---------- 1. rsvp_responses: new columns ----------
alter table public.rsvp_responses
  add column if not exists adult_count  integer default 1;
alter table public.rsvp_responses
  add column if not exists child_count  integer default 0;
alter table public.rsvp_responses
  add column if not exists total_guests integer default 1;
alter table public.rsvp_responses
  add column if not exists companions   jsonb   default '[]'::jsonb;

-- ---------- 2. weddings: companion settings ----------
-- Existing weddings get the safe default: companions disabled.
alter table public.weddings
  add column if not exists rsvp_settings jsonb
  default '{"allow_companions":false,"max_companions":0,"children_allowed":false}'::jsonb;

update public.weddings
set rsvp_settings = '{"allow_companions":false,"max_companions":0,"children_allowed":false}'::jsonb
where rsvp_settings is null;

-- ---------- 3. backfill legacy RSVP rows ----------
-- Old rows (written before this migration) only have guest_count.
-- Treat every legacy guest as an adult. New-format rows always keep
-- total_guests = guest_count, so re-running never touches them.
update public.rsvp_responses
set adult_count  = case when attendance_status = 'yes'
                        then greatest(coalesce(guest_count, 1), 1) else 0 end,
    child_count  = 0,
    total_guests = case when attendance_status = 'yes'
                        then greatest(coalesce(guest_count, 1), 1) else 0 end
where coalesce(companions, '[]'::jsonb) = '[]'::jsonb
  and coalesce(total_guests, -1) is distinct from coalesce(guest_count, 0);

-- ---------- 4. refresh the guest INSERT policy ----------
-- Same rules as before, plus validation of the companion columns.
alter table public.rsvp_responses enable row level security;

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
    and coalesce(adult_count, 0)  between 0 and 20
    and coalesce(child_count, 0)  between 0 and 20
    and coalesce(total_guests, 0) between 0 and 40
    and jsonb_typeof(coalesce(companions, '[]'::jsonb)) = 'array'
    and jsonb_array_length(coalesce(companions, '[]'::jsonb)) <= 20
  );
