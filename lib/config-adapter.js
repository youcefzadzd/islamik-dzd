/**
 * Invitation data builder.
 * wedding-config.json is the fallback/default TEMPLATE; platform
 * weddings (Supabase rows) supply overrides that are deep-merged over
 * it — dates are formatted automatically per language, the {deadline}
 * placeholder resolves, theme shades derive from the four main colors.
 */
import baseConfig from "@/wedding-config.json";

/* ---------- deep merge (arrays replace, objects merge) ---------- */
function isPlainObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}
function deepMerge(base, override) {
  const out = { ...base };
  for (const key of Object.keys(override || {})) {
    out[key] =
      isPlainObject(base?.[key]) && isPlainObject(override[key])
        ? deepMerge(base[key], override[key])
        : override[key];
  }
  return out;
}

/* ---------- color helpers: derive light/dark shades from one hex ---------- */
function mix(hex, target, t) {
  const n = parseInt(hex.replace("#", ""), 16);
  const ch = (shift) => (n >> shift) & 255;
  const v = (a, b) => Math.round(a + (b - a) * t);
  return (
    "#" +
    [v(ch(16), target[0]), v(ch(8), target[1]), v(ch(0), target[2])]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("")
  );
}
const lighten = (hex, t) => mix(hex, [255, 255, 255], t);
const darken = (hex, t) => mix(hex, [0, 0, 0], t);

export function themeColorsFrom(theme) {
  const {
    primaryColor = baseConfig.theme.primaryColor,
    goldColor = baseConfig.theme.goldColor,
    backgroundColor = baseConfig.theme.backgroundColor,
    textColor = baseConfig.theme.textColor,
  } = theme || {};
  return {
    white: "#FFFFFF",
    ivory: backgroundColor,
    ivoryLight: lighten(backgroundColor, 0.55),
    ivoryDark: darken(backgroundColor, 0.045),
    gold: goldColor,
    goldLight: lighten(goldColor, 0.28),
    goldDark: darken(goldColor, 0.18),
    emerald: primaryColor, // legacy alias used by shadows
    emeraldLight: lighten(primaryColor, 0.14),
    emeraldDark: darken(primaryColor, 0.34),
    ink: textColor,
    burgundy: primaryColor,
    burgundyLight: lighten(primaryColor, 0.14),
    burgundyDark: darken(primaryColor, 0.34),
  };
}

export function getThemeColors() {
  return themeColorsFrom(baseConfig.theme);
}

export function getSeo() {
  return baseConfig.seo;
}

/* ---------- date formatting: change one date, every text follows ---------- */
const LOCALES = { fr: "fr-FR", ar: "ar-DZ-u-nu-latn" };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function longDate(isoDay, lang) {
  const d = new Date(isoDay + "T12:00:00");
  const s = new Intl.DateTimeFormat(LOCALES[lang], {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
  return lang === "fr" ? s.replace(/(\d+ )(\p{L})/u, (m, a, b) => a + b.toUpperCase()) : s;
}

function weekday(isoDay, lang) {
  const d = new Date(isoDay + "T12:00:00");
  return cap(new Intl.DateTimeFormat(LOCALES[lang], { weekday: "long" }).format(d));
}

function shortDate(isoDay) {
  const [y, m, d] = isoDay.split("-");
  return `${d}.${m}.${y.slice(2)}`;
}

function displayTime(time, lang) {
  return lang === "fr" ? time.replace(":", "h") : time;
}

/* ---------- guest count options with correct plurals ---------- */
function guestOptions(lang, max) {
  return Array.from({ length: max }, (_, i) => {
    const n = i + 1;
    if (lang === "ar") {
      if (n === 1) return "شخص واحد";
      if (n === 2) return "شخصان";
      if (n <= 10) return `${n} أشخاص`;
      return `${n} شخصًا`;
    }
    return `${n} personne${n > 1 ? "s" : ""}`;
  });
}

/* ---------- the design's own artwork (not owner-editable) ---------- */
const DESIGN_ASSETS = {
  envelopeClosed: "/assets/envelope-first1-open.webp",
  envelopeSeal: "/assets/envelope-first1-seal.webp",
  waxSeal: "/assets/wax-seal.webp",
  invitationPaper: "/assets/invitation-paper.webp",
};

function buildData(lang, config) {
  const t = config.texts[lang];
  const w = config.wedding;
  const other = lang === "fr" ? "ar" : "fr";
  const langSettings = config.languageSettings || { defaultLang: "fr", enabled: ["fr", "ar"] };

  return {
    seo: config.seo,

    couple:
      lang === "ar"
        ? {
            groomName: config.couple.groomNameAr,
            brideName: config.couple.brideNameAr,
            groomNameAr: config.couple.groomName,
            brideNameAr: config.couple.brideName,
          }
        : { ...config.couple },

    hero: {
      bismillah: t.heroTop,
      eyebrow: t.heroTitle,
      scrollHintText: t.scrollHint,
    },

    event: {
      dateTimeISO: w.countdownDate,
      displayDate: longDate(w.date, lang),
      displayDateShort: shortDate(w.date),
      displayDay: weekday(w.date, lang),
      displayTime: displayTime(w.time, lang),
    },

    intro: {
      calligraphyLines: t.introCalligraphy,
      messageLines: t.introMessage,
      ayah: { text: t.ayah, reference: t.ayahReference },
    },

    countdown: {
      heading: t.countdownTitle,
      subtitleAr: t.countdownSubtitle,
      labels: t.countdownLabels,
      expiredText: t.countdownExpired,
    },

    schedule: {
      heading: t.programTitle,
      items: config.program.map((step) => ({
        time: displayTime(step.time, lang),
        title: lang === "ar" ? step.title_ar : step.title_fr,
      })),
    },

    location: {
      heading: t.locationTitle,
      venueName: lang === "ar" ? w.locationNameAr || w.locationName : w.locationName,
      address: lang === "ar" ? w.addressAr || w.address : w.address,
      mapLinkUrl: w.googleMapsUrl,
      mapEmbedUrl: w.googleMapsEmbedUrl || "",
      buttonText: t.mapButton,
    },

    gallery: {
      heading: t.galleryTitle,
      subheading: t.gallerySubtitle,
      images: config.media.gallery.map((src, i) => ({ src, alt: `Photo ${i + 1}` })),
    },

    rsvp: {
      enabled: config.rsvp.enabled,
      heading: t.rsvpTitle,
      subheading: t.rsvpSubtitle.replace("{deadline}", longDate(w.rsvpDeadline, lang)),
      nameLabel: t.nameLabel,
      namePlaceholder: t.namePlaceholder,
      attendingLabel: t.attendanceQuestion,
      attendingYes: t.yesButton,
      attendingNo: t.noButton,
      guestsLabel: t.guestCountLabel,
      guestsPlaceholder: t.guestCountPlaceholder,
      guestsOptions: guestOptions(lang, config.rsvp.maxGuests),
      messageLabel: t.messageLabel,
      messagePlaceholder: t.messagePlaceholder,
      sealButtonText: t.sealButton,
      sealButtonHint: t.submitText,
      submittingText: t.sendingText,
      weddingId: config.weddingId || config.wedding.id || "wedding-1",
      submitEndpoint: config.rsvp.sendToEmail
        ? `https://formsubmit.co/ajax/${config.rsvp.sendToEmail}`
        : "",
      errorMessage: t.errorMessage,
      confirmationTitle: t.successTitle,
      confirmationMessage: t.successMessage,
    },

    thankYou: {
      heading: t.thankYouTitle,
      message: t.thankYouMessage,
      dua: t.dua,
      signatureNames: t.signature,
      contactLabel: t.contactLabel,
    },

    contact: config.contact,
    music: config.media.music || "",
    openingSound: config.media.openingSound || "",

    assets: {
      ...DESIGN_ASSETS,
      heroBackground: config.media.heroImage,
      thankYouBackground: config.media.thankYouImage,
    },

    theme: { colors: themeColorsFrom(config.theme) },
    lang,
    otherLang: other,
    defaultLang: langSettings.defaultLang,
    enabledLangs: langSettings.enabled,
  };
}

/**
 * Build both language variants; `overrides` (from a platform wedding row)
 * are deep-merged over the wedding-config.json template.
 */
export function buildAllData(overrides) {
  const config = overrides ? deepMerge(baseConfig, overrides) : baseConfig;
  return { fr: buildData("fr", config), ar: buildData("ar", config) };
}

const STATIC_DATA = buildAllData();

export function getData(lang) {
  return lang === "ar" ? STATIC_DATA.ar : STATIC_DATA.fr;
}
