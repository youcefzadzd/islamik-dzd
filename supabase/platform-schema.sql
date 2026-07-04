-- ============================================================
--  PLATFORM SCHEMA — multi-client wedding invitation service
--
--  WHERE TO PASTE: Supabase Dashboard → SQL Editor → New query
--  → paste this WHOLE file → Run. (Idempotent: safe to re-run.)
--
--  Model:
--   • weddings: one row per client wedding. NO client access at all —
--     only the server (service_role) reads/writes it. The dashboard
--     password is stored as a scrypt hash, never in clear text.
--   • rsvp_responses: guests (anon key) may only INSERT; nobody can
--     read/update/delete from the browser. The owner/client dashboards
--     go through server API routes.
-- ============================================================

-- ---------- 1. weddings table ----------
create table if not exists public.weddings (
  id                       uuid primary key default gen_random_uuid(),
  wedding_id               text unique not null,
  bride_name               text,
  groom_name               text,
  display_name             text,
  initials                 text,
  wedding_date             date,
  wedding_time             text,
  rsvp_deadline            date,
  location_name            text,
  address                  text,
  google_maps_url          text,
  default_language         text default 'fr',
  languages                jsonb default '["fr","ar"]'::jsonb,
  program                  jsonb default '[]'::jsonb,
  theme                    jsonb default '{}'::jsonb,
  texts                    jsonb default '{}'::jsonb,
  media                    jsonb default '{}'::jsonb,
  contact                  jsonb default '{}'::jsonb,
  dashboard_password_hash  text,
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);

-- keep updated_at fresh automatically
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists weddings_set_updated_at on public.weddings;
create trigger weddings_set_updated_at
  before update on public.weddings
  for each row execute function public.set_updated_at();

-- ---------- 2. lock the weddings table down completely ----------
-- RLS on + zero policies = anon and authenticated clients get nothing.
-- The server API uses the service_role key, which bypasses RLS.
alter table public.weddings enable row level security;

-- ---------- 3. indexes ----------
create unique index if not exists weddings_wedding_id_idx
  on public.weddings (wedding_id);
create index if not exists rsvp_responses_wedding_id_idx
  on public.rsvp_responses (wedding_id);
create index if not exists rsvp_responses_created_at_idx
  on public.rsvp_responses (created_at desc);

-- ---------- 4. rsvp_responses policies (guests: insert only) ----------
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
  );

-- No select/update/delete policies for clients: RLS denies by default.
-- (If you previously created the Supabase-Auth admin policies from
--  rsvp-policies.sql, they can stay — they are harmless.)

-- ---------- 5. sensible defaults ----------
alter table public.rsvp_responses
  alter column created_at set default now();
