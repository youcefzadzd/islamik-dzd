-- ============================================================
--  STAFF USERS MIGRATION — حسابات العمال وصلاحياتهم
--
--  WHERE TO PASTE: Supabase Dashboard → SQL Editor → Run.
--  (Idempotent — safe to re-run.)
--
--  staff_users: حساب لكل عامل (username + scrypt hash) مع صلاحيات
--  jsonb لكل قسم: weddings / orders / media / music / templates /
--  analytics / settings.
--  RLS مفعّل بلا سياسات عامة — server only (service_role).
-- ============================================================

create table if not exists public.staff_users (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  username      text not null unique,
  display_name  text,
  password_hash text not null,
  permissions   jsonb not null default '{}'::jsonb,
  active        boolean not null default true
);

alter table public.staff_users enable row level security;
