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

/* الافتراضي: خانة المرافقين ظاهرة (بالغون فقط، حتى 3) لكل عرس لم
   يضبط أصحابه الإعداد صراحة؛ الأطفال يفعّلهم المالك من اللوحة إن أراد */
export const DEFAULT_RSVP_SETTINGS = {
  allow_companions: true,
  max_adult_companions: 3,
  children_allowed: false,
  max_children: 0,
  max_companions: 3, // legacy combined limit, kept in sync (adults + children)
};

const clamp10 = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(10, Math.trunc(n))) : 0;
};

/**
 * Coerce owner input (snake_case or camelCase) into the canonical
 * weddings.rsvp_settings shape. Rows saved before the adult/child split
 * only carry max_companions — it doubles as the fallback for both limits.
 * Companions off forces every other field off.
 */
export function normalizeRsvpSettings(input) {
  if (!input || typeof input !== "object") return { ...DEFAULT_RSVP_SETTINGS };
  const allowRaw = input.allow_companions ?? input.allowCompanions;
  const childrenRaw = input.children_allowed ?? input.childrenAllowed;
  // الحقل غير المحفوظ إطلاقًا (عرس لم يُضبط) = الافتراضي الجديد: مفعّل
  const unset = allowRaw === undefined;
  const allow = unset ? true : allowRaw === true;
  const children = childrenRaw === true; // الأطفال دائمًا اختيار صريح من اللوحة
  const legacyMax = input.max_companions ?? input.maxCompanions;
  const maxAdults = clamp10(
    input.max_adult_companions ??
      input.maxAdultCompanions ??
      legacyMax ??
      (unset ? DEFAULT_RSVP_SETTINGS.max_adult_companions : 0)
  );
  const maxChildren = clamp10(
    input.max_children ?? input.maxChildren ?? (children ? legacyMax : 0) ?? 0
  );
  return {
    allow_companions: allow,
    max_adult_companions: allow ? maxAdults : 0,
    children_allowed: allow ? children : false,
    max_children: allow && children ? maxChildren : 0,
    max_companions: allow ? maxAdults + (children ? maxChildren : 0) : 0,
  };
}

/* الحرف الأول كبير للعرض — العربية تمرّ كما هي */
const displayName = (s) =>
  typeof s === "string" && s.trim()
    ? s
        .trim()
        .toLowerCase()
        .replace(/(^|[\s\-'’])(\p{L})/gu, (m, sep, ch) => sep + ch.toUpperCase())
    : null;

/**
 * أسماء العروسين بالترتيب الصحيح (صاحبة الدعوة امرأة → العروس أولًا)
 * في اللغتين — تُستعمل لعنوان الصفحة وتوقيع قسم الشكر حين لا يكتب
 * المالك نصًا خاصًا، حتى لا يظهر أبدًا اسما عرس البذرة.
 */
export function coupleDisplay(row) {
  const texts = row.texts || {};
  const femaleFirst = texts.invitation?.honoreeGender === "female";
  const gFr = displayName(row.groom_name);
  const bFr = displayName(row.bride_name);
  const gAr = displayName(texts.couple?.groomNameAr) || gFr;
  const bAr = displayName(texts.couple?.brideNameAr) || bFr;
  if (!gFr || !bFr) return null;
  const [xFr, yFr] = femaleFirst ? [bFr, gFr] : [gFr, bFr];
  const [xAr, yAr] = femaleFirst ? [bAr, gAr] : [gAr, bAr];
  return { fr: `${xFr} & ${yFr}`, ar: `${xAr} و${yAr}` };
}

/** عنوان ووصف الصفحة العامة /w/<id> بلغة العرس الافتراضية */
export function seoForRow(row) {
  const pair = coupleDisplay(row);
  if (!pair) return null;
  const ar = row.default_language === "ar";
  return {
    title: ar ? `حفل زفاف ${pair.ar}` : `Mariage de ${pair.fr}`,
    description: ar
      ? "دعوة لحضور حفل زفافنا — بمشيئة الله."
      : "Invitation à notre mariage — avec la grâce d'Allah.",
  };
}

/**
 * Turn a weddings row into overrides on top of the wedding-config.json
 * template (the config stays the single fallback for every text/asset
 * the owner did not customize).
 */
export function rowToOverrides(row) {
  const texts = row.texts || {};
  const media = row.media || {};
  const rsvpSettings = normalizeRsvpSettings(row.rsvp_settings);
  const pair = coupleDisplay(row);
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
      heroVideo: media.heroVideo || undefined,
      thankYouImage: media.thankYouImage || undefined,
      gallery: Array.isArray(media.gallery) && media.gallery.length ? media.gallery : undefined,
      music: media.music ?? undefined,
      openingSound: media.openingSound ?? undefined,
    },
    rsvp: {
      allowCompanions: rsvpSettings.allow_companions,
      maxAdultCompanions: rsvpSettings.max_adult_companions,
      childrenAllowed: rsvpSettings.children_allowed,
      maxChildren: rsvpSettings.max_children,
      maxCompanions: rsvpSettings.max_companions,
    },
    theme: row.theme && Object.keys(row.theme).length ? row.theme : undefined,
    seo: seoForRow(row) || undefined,
    texts: {
      /* توقيع الشكر: نص المالك إن وُجد، وإلا اسما العروسين —
         لا يتسرب توقيع البذرة إلى أعراس حقيقية أبدًا */
      fr: { ...(texts.fr || {}), signature: texts.fr?.signature || pair?.fr || undefined },
      ar: { ...(texts.ar || {}), signature: texts.ar?.signature || pair?.ar || undefined },
      /* Wedding Invitation section (Heritage): fully owner-edited copy,
         one group per language — { ar: {...}, fr: {...} } */
      invitation: texts.invitation || undefined,
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
