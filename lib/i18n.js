/**
 * Bilingual data: the Arabic dictionary overrides only text fields on top
 * of the French base, so dates, links, assets and colors are never
 * duplicated.
 */
import fr from "@/data/invitationData";
import ar from "@/data/invitationData.ar";

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(base, override) {
  const out = { ...base };
  for (const key of Object.keys(override)) {
    out[key] =
      isPlainObject(base[key]) && isPlainObject(override[key])
        ? deepMerge(base[key], override[key])
        : override[key];
  }
  return out;
}

const merged = { fr, ar: deepMerge(fr, ar) };

export function getData(lang) {
  return lang === "ar" ? merged.ar : merged.fr;
}
