-- ============================================================
--  CLIENT INFOS MIGRATION — استمارات معلومات العرس (/infos)
--
--  WHERE TO PASTE: Supabase Dashboard → SQL Editor → New query
--  → paste this WHOLE file → Run. (Idempotent: safe to re-run.)
--
--  Adds:
--   • client_infos: fiches filled by clients on /infos —
--     couple names (FR + AR), honoree, parents, event details,
--     chosen template + pack, day program, notes, phone.
--   • RLS enabled with NO public policies — only the server
--     (service_role key) can read/write, same model as site_orders.
--
--  Run this BEFORE clients use the /infos form (until then the
--  form falls back to WhatsApp automatically).
-- ============================================================

create table if not exists public.client_infos (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  groom_name   text not null,
  groom_name_ar text,
  bride_name   text not null,
  bride_name_ar text,
  honoree      text,          -- groom / bride (الدعوة باسم من)
  father_name  text,
  mother_name  text,
  wedding_date date,
  wedding_time text,
  venue        text,
  address      text,
  maps_url     text,
  template_id  text,          -- islamic-royal / heritage / floral-romantic
  pack_id      text,          -- essential / premium / royal
  program      text,
  notes        text,
  phone        text not null,
  lang         text,          -- ar / fr (لغة العميل وقت الملء)
  status       text not null default 'new'  -- new / processed
);

alter table public.client_infos enable row level security;

-- لا سياسات عامة: القراءة والكتابة عبر service_role فقط (من السيرفر).

create index if not exists client_infos_created_at_idx
  on public.client_infos (created_at desc);
