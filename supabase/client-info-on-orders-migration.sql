-- ============================================================
--  CLIENT INFO ON ORDERS — استمارة /infos تلتصق بالطلب نفسه
--
--  WHERE TO PASTE: Supabase Dashboard → SQL Editor → New query
--  → paste this WHOLE file → Run. (Idempotent: safe to re-run.)
--
--  When the client fills dawati-dz.com/infos the fiche is stored
--  ON the matching site_orders row (client_info jsonb) and shows
--  inside the order card in the En préparation pipeline — no
--  separate table, no separate dashboard section.
-- ============================================================

alter table public.site_orders add column if not exists client_info    jsonb;
alter table public.site_orders add column if not exists client_info_at timestamptz;

-- الجدول المنفصل من النسخة السابقة لم يعد مستعملًا (إن كان أُنشئ)
drop table if exists public.client_infos;
