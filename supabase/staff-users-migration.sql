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
  email         text not null unique,
  display_name  text,
  password_hash text not null,
  permissions   jsonb not null default '{}'::jsonb,
  active        boolean not null default true
);

-- النسخة الأولى استعملت username — أعد تسميته إلى email إن وُجد
do $$ begin
  if exists (select 1 from information_schema.columns
    where table_schema='public' and table_name='staff_users' and column_name='username') then
    alter table public.staff_users rename column username to email;
  end if;
end $$;

alter table public.staff_users enable row level security;
