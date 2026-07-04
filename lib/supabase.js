/**
 * Supabase browser client (anon key — safe to expose; Row Level Security
 * does the real protection). Returns null when the env vars are not set,
 * so the site keeps working without Supabase.
 */
import { createClient } from "@supabase/supabase-js";

let client = null;

export function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key);
  return client;
}
