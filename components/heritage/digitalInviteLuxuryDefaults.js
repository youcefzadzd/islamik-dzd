/**
 * Digital Invite Luxury V1 (Heritage) — template-owned display defaults.
 *
 * DISPLAY-TIME ONLY: nothing here is ever written to Supabase. The rule,
 * applied through getDisplayText(), is always:
 *
 *   shown value = saved value (trimmed) — or, when the saved value is
 *   null / undefined / "" / whitespace-only — the template default.
 *
 * The moment the owner types a value in the dashboard it wins; the moment
 * they clear it, the default quietly returns. These defaults belong to
 * THIS template only — never sourced from Islamic Royal V2.
 */

/* empty-safe display rule (null / undefined / "" / spaces ⇒ fallback) */
export function getDisplayText(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export const HERITAGE_DEFAULTS = {
  /* hero media — the template's own footage; the poster covers devices
     that refuse to play video at all */
  heroVideo: "/assets/templates/demo-hero.mp4",
  heroPoster: "/assets/templates/heritage-gallery/wedding_photo_1.jpg",

  /* the basmala is language-independent (always Arabic script) */
  basmala: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",

  fr: {
    heroEyebrow: "Wedding Day",
    groomName: "Alexandre",
    brideName: "Diane",
    heroDate: "18 Septembre 2026",
    /* the gendered "leur fils/leur fille [nom]" line follows separately */
    invitationText:
      "ont l’immense plaisir de vous convier à la célébration du mariage de",
    dateIntro: "qui sera célébré, si Dieu le veut,",
    hallIntro: "à la salle",
    rsvpTitle: "Confirmez votre présence",
  },

  ar: {
    heroEyebrow: "يوم الزفاف",
    groomName: "يوسف",
    brideName: "كاتيا",
    heroDate: "18 سبتمبر 2026",
    invitationTitle: "حفل زفاف",
    invitationText: "يتشرفان بدعوتكم لحضور",
    dateIntro: "وذلك بمشيئة الله تعالى يوم",
    hallIntro: "بقاعة",
    rsvpTitle: "أكد حضورك",
  },
};
