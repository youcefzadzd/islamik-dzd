/**
 * Floral Romantic — template-owned display defaults.
 *
 * DISPLAY-TIME ONLY: nothing here is ever written to Supabase. The rule,
 * applied through getDisplayText(), is always:
 *
 *   shown value = saved value (trimmed) — or, when the saved value is
 *   null / undefined / "" / whitespace-only — the template default.
 *
 * These defaults belong to THIS template only — never sourced from
 * Islamic Royal V2 or Digital Invite Luxury V1.
 */

/* empty-safe display rule (null / undefined / "" / spaces ⇒ fallback) */
export function getDisplayText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

/* formal name casing — first letter of each word (also after hyphens /
   apostrophes) capitalized, the rest lowercase. Arabic script has no
   letter case, so it passes through untouched. */
export function toFormalName(value) {
  if (typeof value !== "string") return value;
  return value
    .toLowerCase()
    .replace(/(^|[\s\-'’])(\p{L})/gu, (m, sep, ch) => sep + ch.toUpperCase());
}

export const FLORAL_DEFAULTS = {
  /* the basmala is language-independent (always Arabic script) */
  basmala: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",

  fr: {
    heroEyebrow: "Wedding Day",
    groomName: "Adam",
    brideName: "Lina",
    heroDate: "18 Septembre 2026",
    invitationText:
      "ont l’immense plaisir de vous convier à la célébration du mariage de",
    dateIntro: "qui sera célébré, si Dieu le veut,",
    hallIntro: "à la salle",
    rsvpTitle: "Confirmez votre présence",
  },

  ar: {
    heroEyebrow: "يوم الزفاف",
    groomName: "آدم",
    brideName: "لينة",
    heroDate: "18 سبتمبر 2026",
    invitationTitle: "حفل زفاف",
    invitationText: "يتشرفان بدعوتكم لمشاركتهما أفراح زفاف",
    dateIntro: "وذلك بمشيئة الله تعالى يوم",
    hallIntro: "بقاعة",
    rsvpTitle: "أكدوا حضوركم",
  },
};
