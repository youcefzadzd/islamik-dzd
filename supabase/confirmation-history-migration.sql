-- ============================================================
--  CONFIRMATION HISTORY — سجلّ حالات التأكيد على الطلب
--
--  WHERE TO PASTE: Supabase Dashboard → SQL Editor → Run.
--  (Idempotent: safe to re-run.)
--
--  Every non-empty motif chosen in the orders panel is appended to
--  site_orders.confirmation_history as { status, at } and the full
--  timeline stays visible inside the order card.
-- ============================================================

alter table public.site_orders add column if not exists confirmation_history jsonb;
