/**
 * Wizard data model: wedding row <-> form state <-> API body.
 * Anything left empty falls back to the wedding-config.json template.
 */
import { normalizeTemplateId } from "@/lib/templates";

export const EMPTY_PROGRAM_STEP = {
  time: "",
  title_fr: "",
  title_ar: "",
  description_fr: "",
  description_ar: "",
};

/* Wedding Invitation section (Heritage template): one group of fully
   owner-edited lines per language, stored in texts.invitation.{ar,fr} */
export const INVITATION_FIELDS = [
  "basmala",
  "fatherName",
  "motherName",
  "invitationText",
  "mainTitle",
  "brideName",
  "dateIntro",
  "weddingDate",
  "time",
  "hallIntro",
  "hallName",
  "footerMessage",
];

const invitationGroupToForm = (g = {}) =>
  Object.fromEntries(INVITATION_FIELDS.map((k) => [k, g?.[k] || ""]));

const invitationGroupToBody = (g = {}) => {
  const out = {};
  for (const k of INVITATION_FIELDS) {
    const v = (g[k] || "").trim();
    if (v) out[k] = v;
  }
  return Object.keys(out).length ? out : undefined;
};

export function rowToForm(w = {}) {
  const texts = w.texts || {};
  const theme = w.theme || {};
  const media = w.media || {};
  const contact = w.contact || {};
  const rsvpSettings = w.rsvp_settings || {};
  return {
    // step 1 — couple & date
    groomName: w.groom_name || "",
    brideName: w.bride_name || "",
    displayName: w.display_name || "",
    groomNameAr: texts.couple?.groomNameAr || "",
    brideNameAr: texts.couple?.brideNameAr || "",
    initials: w.initials || "",
    weddingDate: w.wedding_date || "",
    weddingTime: w.wedding_time || "",
    rsvpDeadline: w.rsvp_deadline || "",
    // RSVP companion settings (max_companions = legacy combined limit)
    // العرس الذي لم يُضبط قط يبدأ على الافتراضي الجديد: مرافقون مفعّلون (3+2)
    allowCompanions: (rsvpSettings.allow_companions ?? true) === true,
    maxAdultCompanions: String(
      rsvpSettings.max_adult_companions ??
        rsvpSettings.max_companions ??
        (rsvpSettings.allow_companions === undefined ? 3 : 0)
    ),
    childrenAllowed:
      rsvpSettings.children_allowed === undefined
        ? rsvpSettings.allow_companions === undefined
        : rsvpSettings.children_allowed === true,
    maxChildren: String(
      rsvpSettings.max_children ??
        (rsvpSettings.children_allowed === true
          ? rsvpSettings.max_companions ?? 0
          : rsvpSettings.allow_companions === undefined
            ? 2
            : 0)
    ),
    // step 2 — venue
    locationName: w.location_name || "",
    locationNameAr: texts.location?.nameAr || "",
    address: w.address || "",
    addressAr: texts.location?.addressAr || "",
    googleMapsUrl: w.google_maps_url || "",
    mapEmbedUrl: media.mapEmbedUrl || "",
    // step 3 — media
    heroImage: media.heroImage || "",
    heroVideo: media.heroVideo || "",
    thankYouImage: media.thankYouImage || "",
    galleryText: Array.isArray(media.gallery) ? media.gallery.join("\n") : "",
    music: media.music || "",
    openingSound: media.openingSound || "",
    // step 4 — program
    program:
      Array.isArray(w.program) && w.program.length
        ? w.program
        : [{ ...EMPTY_PROGRAM_STEP }],
    // step 5 — settings
    template: normalizeTemplateId(theme.template),
    defaultLanguage: w.default_language || "fr",
    langFr: (w.languages || ["fr", "ar"]).includes("fr"),
    langAr: (w.languages || ["fr", "ar"]).includes("ar"),
    primaryColor: theme.primaryColor || "#7B1E2B",
    goldColor: theme.goldColor || "#C6A15B",
    backgroundColor: theme.backgroundColor || "#F8F3EA",
    textColor: theme.textColor || "#5A4636",
    invitationAr: invitationGroupToForm(texts.invitation?.ar),
    invitationFr: invitationGroupToForm(texts.invitation?.fr),
    /* language-independent: gender of the celebrated person (male|female),
       drives the "ابنهما/ابنتهما · leur fils/leur fille" phrase */
    honoreeGender:
      texts.invitation?.honoreeGender === "male" ||
      texts.invitation?.honoreeGender === "female"
        ? texts.invitation.honoreeGender
        : "",
    heroTitleFr: texts.fr?.heroTitle || "",
    heroTitleAr: texts.ar?.heroTitle || "",
    rsvpTitleFr: texts.fr?.rsvpTitle || "",
    rsvpTitleAr: texts.ar?.rsvpTitle || "",
    rsvpSubtitleFr: texts.fr?.rsvpSubtitle || "",
    rsvpSubtitleAr: texts.ar?.rsvpSubtitle || "",
    phone: contact.phone || "",
    whatsapp: contact.whatsapp || "",
    dashboardPassword: "",
  };
}

export function formToBody(f) {
  const langTexts = (heroTitle, rsvpTitle, rsvpSubtitle) => {
    const out = {};
    if (heroTitle) out.heroTitle = heroTitle;
    if (rsvpTitle) out.rsvpTitle = rsvpTitle;
    if (rsvpSubtitle) out.rsvpSubtitle = rsvpSubtitle;
    return Object.keys(out).length ? out : undefined;
  };
  const gallery = f.galleryText
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const languages = [f.langFr && "fr", f.langAr && "ar"].filter(Boolean);
  return {
    groomName: f.groomName.trim(),
    brideName: f.brideName.trim(),
    displayName: f.displayName.trim() || undefined,
    initials: f.initials.trim() || undefined,
    weddingDate: f.weddingDate || undefined,
    weddingTime: f.weddingTime || undefined,
    rsvpDeadline: f.rsvpDeadline || undefined,
    locationName: f.locationName.trim() || undefined,
    address: f.address.trim() || undefined,
    googleMapsUrl: f.googleMapsUrl.trim() || undefined,
    defaultLanguage: f.defaultLanguage,
    languages: languages.length ? languages : ["fr", "ar"],
    program: f.program.filter((s) => s.time && (s.title_fr || s.title_ar)),
    theme: {
      template: normalizeTemplateId(f.template),
      primaryColor: f.primaryColor,
      goldColor: f.goldColor,
      backgroundColor: f.backgroundColor,
      textColor: f.textColor,
    },
    texts: {
      couple: {
        groomNameAr: f.groomNameAr.trim() || undefined,
        brideNameAr: f.brideNameAr.trim() || undefined,
      },
      location: {
        nameAr: f.locationNameAr.trim() || undefined,
        addressAr: f.addressAr.trim() || undefined,
      },
      fr: langTexts(f.heroTitleFr, f.rsvpTitleFr, f.rsvpSubtitleFr),
      ar: langTexts(f.heroTitleAr, f.rsvpTitleAr, f.rsvpSubtitleAr),
      invitation: (() => {
        const ar = invitationGroupToBody(f.invitationAr || {});
        const fr = invitationGroupToBody(f.invitationFr || {});
        const honoreeGender =
          f.honoreeGender === "male" || f.honoreeGender === "female"
            ? f.honoreeGender
            : undefined;
        return ar || fr || honoreeGender ? { ar, fr, honoreeGender } : undefined;
      })(),
    },
    media: {
      mapEmbedUrl: f.mapEmbedUrl.trim() || undefined,
      heroImage: f.heroImage.trim() || undefined,
      heroVideo: f.heroVideo.trim() || undefined,
      thankYouImage: f.thankYouImage.trim() || undefined,
      gallery: gallery.length ? gallery : undefined,
      music: f.music.trim() || undefined,
      openingSound: f.openingSound.trim() || undefined,
    },
    contact: { phone: f.phone.trim(), whatsapp: f.whatsapp.trim() },
    rsvpSettings: {
      allow_companions: f.allowCompanions === true,
      max_adult_companions: f.allowCompanions
        ? Math.max(0, Math.min(10, parseInt(f.maxAdultCompanions, 10) || 0))
        : 0,
      children_allowed: f.allowCompanions ? f.childrenAllowed === true : false,
      max_children:
        f.allowCompanions && f.childrenAllowed === true
          ? Math.max(0, Math.min(10, parseInt(f.maxChildren, 10) || 0))
          : 0,
    },
    dashboardPassword: f.dashboardPassword || undefined,
  };
}
