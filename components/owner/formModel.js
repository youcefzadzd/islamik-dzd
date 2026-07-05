/**
 * Wizard data model: wedding row <-> form state <-> API body.
 * Anything left empty falls back to the wedding-config.json template.
 */

export const EMPTY_PROGRAM_STEP = { time: "", title_fr: "", title_ar: "" };

export function rowToForm(w = {}) {
  const texts = w.texts || {};
  const theme = w.theme || {};
  const media = w.media || {};
  const contact = w.contact || {};
  return {
    // step 1 — couple & date
    groomName: w.groom_name || "",
    brideName: w.bride_name || "",
    groomNameAr: texts.couple?.groomNameAr || "",
    brideNameAr: texts.couple?.brideNameAr || "",
    initials: w.initials || "",
    weddingDate: w.wedding_date || "",
    weddingTime: w.wedding_time || "",
    rsvpDeadline: w.rsvp_deadline || "",
    // step 2 — venue
    locationName: w.location_name || "",
    locationNameAr: texts.location?.nameAr || "",
    address: w.address || "",
    addressAr: texts.location?.addressAr || "",
    googleMapsUrl: w.google_maps_url || "",
    mapEmbedUrl: media.mapEmbedUrl || "",
    // step 3 — media
    heroImage: media.heroImage || "",
    thankYouImage: media.thankYouImage || "",
    galleryText: Array.isArray(media.gallery) ? media.gallery.join("\n") : "",
    music: media.music || "",
    // step 4 — program
    program:
      Array.isArray(w.program) && w.program.length
        ? w.program
        : [{ ...EMPTY_PROGRAM_STEP }],
    // step 5 — settings
    defaultLanguage: w.default_language || "fr",
    langFr: (w.languages || ["fr", "ar"]).includes("fr"),
    langAr: (w.languages || ["fr", "ar"]).includes("ar"),
    primaryColor: theme.primaryColor || "#7B1E2B",
    goldColor: theme.goldColor || "#C6A15B",
    backgroundColor: theme.backgroundColor || "#F8F3EA",
    textColor: theme.textColor || "#5A4636",
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
    },
    media: {
      mapEmbedUrl: f.mapEmbedUrl.trim() || undefined,
      heroImage: f.heroImage.trim() || undefined,
      thankYouImage: f.thankYouImage.trim() || undefined,
      gallery: gallery.length ? gallery : undefined,
      music: f.music.trim() || undefined,
    },
    contact: { phone: f.phone.trim(), whatsapp: f.whatsapp.trim() },
    dashboardPassword: f.dashboardPassword || undefined,
  };
}
