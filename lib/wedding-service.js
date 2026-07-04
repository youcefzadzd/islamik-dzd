/**
 * Server-only access to the weddings table (service_role key — bypasses
 * RLS, never shipped to the browser) and the mapping from a wedding row
 * to config overrides for the invitation renderer.
 */
import { createClient } from "@supabase/supabase-js";
import { randomInt } from "crypto";

export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/* WED-XXXXXX ids without lookalike characters */
const ID_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function generateWeddingId() {
  let s = "";
  for (let i = 0; i < 6; i++) s += ID_CHARS[randomInt(ID_CHARS.length)];
  return `WED-${s}`;
}

export async function getWeddingByPublicId(weddingId) {
  const supabase = getAdminClient();
  if (!supabase) return { configured: false, wedding: null };
  const { data, error } = await supabase
    .from("weddings")
    .select("*")
    .eq("wedding_id", weddingId)
    .maybeSingle();
  if (error) return { configured: true, wedding: null };
  return { configured: true, wedding: data };
}

/** strip secrets before anything leaves the server */
export function sanitizeWedding(row) {
  if (!row) return null;
  const { dashboard_password_hash, ...rest } = row;
  return rest;
}

/**
 * Turn a weddings row into overrides on top of the wedding-config.json
 * template (the config stays the single fallback for every text/asset
 * the owner did not customize).
 */
export function rowToOverrides(row) {
  const texts = row.texts || {};
  const media = row.media || {};
  const overrides = {
    weddingId: row.wedding_id,
    couple: {
      groomName: row.groom_name || undefined,
      brideName: row.bride_name || undefined,
      groomNameAr: texts.couple?.groomNameAr || row.groom_name || undefined,
      brideNameAr: texts.couple?.brideNameAr || row.bride_name || undefined,
    },
    wedding: {
      date: row.wedding_date || undefined,
      time: row.wedding_time || undefined,
      countdownDate:
        row.wedding_date ? `${row.wedding_date}T${row.wedding_time || "00:00"}:00` : undefined,
      rsvpDeadline: row.rsvp_deadline || undefined,
      locationName: row.location_name || undefined,
      locationNameAr: texts.location?.nameAr || row.location_name || undefined,
      address: row.address || undefined,
      addressAr: texts.location?.addressAr || row.address || undefined,
      googleMapsUrl: row.google_maps_url || undefined,
      googleMapsEmbedUrl: media.mapEmbedUrl ?? undefined,
    },
    contact: row.contact || undefined,
    program: Array.isArray(row.program) && row.program.length ? row.program : undefined,
    media: {
      heroImage: media.heroImage || undefined,
      thankYouImage: media.thankYouImage || undefined,
      gallery: Array.isArray(media.gallery) && media.gallery.length ? media.gallery : undefined,
      music: media.music ?? undefined,
      openingSound: media.openingSound ?? undefined,
    },
    theme: row.theme && Object.keys(row.theme).length ? row.theme : undefined,
    texts: {
      fr: texts.fr || undefined,
      ar: texts.ar || undefined,
    },
    languageSettings: {
      defaultLang: row.default_language === "ar" ? "ar" : "fr",
      enabled: Array.isArray(row.languages) && row.languages.length ? row.languages : ["fr", "ar"],
    },
  };
  return prune(overrides);
}

/* drop undefined leaves so the deep-merge never erases template values */
function prune(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const p = prune(v);
      if (p === undefined) continue;
      if (p && typeof p === "object" && !Array.isArray(p) && Object.keys(p).length === 0) continue;
      out[k] = p;
    }
    return out;
  }
  return value;
}
