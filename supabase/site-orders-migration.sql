-- ============================================================
--  SITE ORDERS MIGRATION — طلبات موقع العرض والبيع (/site)
--
--  WHERE TO PASTE: Supabase Dashboard → SQL Editor → New query
--  → paste this WHOLE file → Run. (Idempotent: safe to re-run,
--  including on top of the older single-name version of the table.)
--
--  Adds:
--   • site_orders: leads from the /site/order wizard —
--     groom + bride names, wedding date, venue, phone,
--     chosen template + pack.
--   • RLS enabled with NO public policies — only the server
--     (service_role key) can read/write, same model as weddings.
--
--  Run this BEFORE using the /site/order form.
-- ============================================================

create table if not exists public.site_orders (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  groom_name   text,
  bride_name   text,
  wedding_date date,
  venue        text,
  phone        text not null,
  template_id  text,          -- islamic-royal / heritage / floral-romantic ...
  pack_id      text,          -- essential / premium / royal
  lang         text,          -- ar / fr (لغة الزائر وقت الطلب)
  status       text not null default 'new'  -- new / contacted / done / cancelled
);

-- لو كان الجدول قد أُنشئ بالنسخة القديمة (full_name فقط) — أضف الأعمدة الجديدة
alter table public.site_orders add column if not exists groom_name   text;
alter table public.site_orders add column if not exists bride_name   text;
alter table public.site_orders add column if not exists wedding_date date;
alter table public.site_orders add column if not exists venue        text;
-- ربط الطلب بالعرس المُنشأ منه (WED-XXXXXX) — زر Modifier في لوحة الطلبات
alter table public.site_orders add column if not exists wedding_id   text;

-- النسخة القديمة كانت تُلزم full_name — أزل الإلزام إن وُجد العمود
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'site_orders'
      and column_name = 'full_name'
  ) then
    alter table public.site_orders alter column full_name drop not null;
  end if;
end $$;

alter table public.site_orders enable row level security;

-- لا سياسات عامة: القراءة والكتابة عبر service_role فقط (من السيرفر).

create index if not exists site_orders_created_at_idx
  on public.site_orders (created_at desc);
