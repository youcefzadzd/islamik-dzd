/**
 * بيكسلات الإعلانات (Meta / TikTok) — أدوات مشتركة بين واجهات API.
 * تُخزَّن في site_settings تحت المفتاح "ad_pixels" كنص JSON:
 *   { "facebook": ["1234567890"], "tiktok": ["ABC123..."] }
 * عدة معرّفات لكل منصة (حتى 5) — كل بيكسل يستقبل نفس الأحداث.
 */

const FB_RE = /^\d{5,20}$/; // معرّف Meta رقمي
const TT_RE = /^[A-Za-z0-9]{5,40}$/; // معرّف TikTok حروف/أرقام

/* تنظيف قائمة معرّفات: نص، بلا فراغات، صيغة صالحة، بلا تكرار، بحد أقصى 5 */
function cleanPixelList(list, re) {
  if (!Array.isArray(list)) return [];
  const out = [];
  for (const raw of list) {
    const id = String(raw || "").trim();
    if (id && re.test(id) && !out.includes(id)) out.push(id);
    if (out.length >= 5) break;
  }
  return out;
}

export function normalizePixels(input) {
  const p = input && typeof input === "object" ? input : {};
  return {
    facebook: cleanPixelList(p.facebook, FB_RE),
    tiktok: cleanPixelList(p.tiktok, TT_RE),
  };
}

/** قيمة site_settings.ad_pixels (نص JSON) → كائن نظيف دائمًا */
export function parsePixelsValue(value) {
  try {
    return normalizePixels(JSON.parse(value));
  } catch {
    return { facebook: [], tiktok: [] };
  }
}
