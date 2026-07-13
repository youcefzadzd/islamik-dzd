-- ============================================================
--  SITE SETTINGS MIGRATION — إعدادات الموقع القابلة للتعديل من لوحة التحكم
--
--  WHERE TO PASTE: Supabase Dashboard → SQL Editor → Run.
--  (Idempotent — safe to re-run.)
--
--  site_settings: key/value بسيطة (مثال: whatsapp_number).
--  RLS مفعّل بلا سياسات عامة — القراءة والكتابة عبر service_role فقط،
--  والموقع يقرأها عبر /api/site/settings (قيم عامة مُنتقاة فقط).
-- ============================================================

create table if not exists public.site_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
