"use client";

import { useState } from "react";

/**
 * Owner form for creating/editing a wedding. Emits the API body shape.
 * Anything left empty falls back to the wedding-config.json template.
 */

const EMPTY_STEP = { time: "", title_fr: "", title_ar: "" };

export function rowToForm(w) {
  const texts = w.texts || {};
  const theme = w.theme || {};
  const media = w.media || {};
  const contact = w.contact || {};
  return {
    groomName: w.groom_name || "",
    brideName: w.bride_name || "",
    groomNameAr: texts.couple?.groomNameAr || "",
    brideNameAr: texts.couple?.brideNameAr || "",
    initials: w.initials || "",
    weddingDate: w.wedding_date || "",
    weddingTime: w.wedding_time || "",
    rsvpDeadline: w.rsvp_deadline || "",
    locationName: w.location_name || "",
    locationNameAr: texts.location?.nameAr || "",
    address: w.address || "",
    addressAr: texts.location?.addressAr || "",
    googleMapsUrl: w.google_maps_url || "",
    mapEmbedUrl: media.mapEmbedUrl || "",
    defaultLanguage: w.default_language || "fr",
    langFr: (w.languages || ["fr", "ar"]).includes("fr"),
    langAr: (w.languages || ["fr", "ar"]).includes("ar"),
    program: Array.isArray(w.program) && w.program.length ? w.program : [{ ...EMPTY_STEP }],
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
    media: { mapEmbedUrl: f.mapEmbedUrl.trim() || undefined },
    contact: { phone: f.phone.trim(), whatsapp: f.whatsapp.trim() },
    dashboardPassword: f.dashboardPassword || undefined,
  };
}

const inputCls =
  "w-full rounded-lg border border-gold/40 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-burgundy";
const labelCls = "mb-1 block text-xs font-medium uppercase tracking-wider text-ink/60";

function Field({ label, children }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <fieldset className="rounded-xl border border-gold/30 bg-ivory-light p-4">
      <legend className="px-2 text-sm font-semibold text-gold-dark">{title}</legend>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export default function WeddingForm({ initial, onSubmit, submitLabel, requirePassword, busy }) {
  const [f, setF] = useState(initial);
  const set = (key) => (e) =>
    setF((prev) => ({ ...prev, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const setStep = (i, key, value) =>
    setF((prev) => {
      const program = prev.program.map((s, j) => (j === i ? { ...s, [key]: value } : s));
      return { ...prev, program };
    });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formToBody(f));
      }}
      className="space-y-4 text-left"
    >
      <Section title="Couple">
        <Field label="Marié (FR)">
          <input required className={inputCls} value={f.groomName} onChange={set("groomName")} />
        </Field>
        <Field label="Mariée (FR)">
          <input required className={inputCls} value={f.brideName} onChange={set("brideName")} />
        </Field>
        <Field label="Marié (AR)">
          <input dir="rtl" className={inputCls} value={f.groomNameAr} onChange={set("groomNameAr")} />
        </Field>
        <Field label="Mariée (AR)">
          <input dir="rtl" className={inputCls} value={f.brideNameAr} onChange={set("brideNameAr")} />
        </Field>
        <Field label="Initiales (ex. A.F)">
          <input className={inputCls} value={f.initials} onChange={set("initials")} />
        </Field>
      </Section>

      <Section title="Date & heure">
        <Field label="Date du mariage">
          <input type="date" className={inputCls} value={f.weddingDate} onChange={set("weddingDate")} />
        </Field>
        <Field label="Heure">
          <input type="time" className={inputCls} value={f.weddingTime} onChange={set("weddingTime")} />
        </Field>
        <Field label="Date limite RSVP">
          <input type="date" className={inputCls} value={f.rsvpDeadline} onChange={set("rsvpDeadline")} />
        </Field>
      </Section>

      <Section title="Lieu">
        <Field label="Nom de la salle (FR)">
          <input className={inputCls} value={f.locationName} onChange={set("locationName")} />
        </Field>
        <Field label="Nom de la salle (AR)">
          <input dir="rtl" className={inputCls} value={f.locationNameAr} onChange={set("locationNameAr")} />
        </Field>
        <Field label="Adresse (FR)">
          <input className={inputCls} value={f.address} onChange={set("address")} />
        </Field>
        <Field label="Adresse (AR)">
          <input dir="rtl" className={inputCls} value={f.addressAr} onChange={set("addressAr")} />
        </Field>
        <Field label="Lien Google Maps">
          <input className={inputCls} value={f.googleMapsUrl} onChange={set("googleMapsUrl")} />
        </Field>
        <Field label="Carte intégrée (embed URL, optionnel)">
          <input className={inputCls} value={f.mapEmbedUrl} onChange={set("mapEmbedUrl")} />
        </Field>
      </Section>

      <Section title="Langues">
        <Field label="Langue par défaut">
          <select className={inputCls} value={f.defaultLanguage} onChange={set("defaultLanguage")}>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
          </select>
        </Field>
        <div className="flex items-end gap-5 pb-1">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={f.langFr} onChange={set("langFr")} /> Français
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={f.langAr} onChange={set("langAr")} /> العربية
          </label>
        </div>
      </Section>

      <Section title="Programme">
        <div className="sm:col-span-2 space-y-2">
          {f.program.map((s, i) => (
            <div key={i} className="grid grid-cols-[90px_1fr_1fr_36px] items-center gap-2">
              <input
                type="time"
                className={inputCls}
                value={s.time}
                onChange={(e) => setStep(i, "time", e.target.value)}
              />
              <input
                className={inputCls}
                placeholder="Titre (FR)"
                value={s.title_fr}
                onChange={(e) => setStep(i, "title_fr", e.target.value)}
              />
              <input
                dir="rtl"
                className={inputCls}
                placeholder="العنوان (AR)"
                value={s.title_ar}
                onChange={(e) => setStep(i, "title_ar", e.target.value)}
              />
              <button
                type="button"
                aria-label="Supprimer l'étape"
                onClick={() =>
                  setF((prev) => ({
                    ...prev,
                    program: prev.program.filter((_, j) => j !== i),
                  }))
                }
                className="rounded-lg border border-burgundy/40 py-2 text-burgundy hover:bg-burgundy hover:text-white"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setF((prev) => ({ ...prev, program: [...prev.program, { ...EMPTY_STEP }] }))}
            className="rounded-lg border border-gold/50 px-3 py-1.5 text-sm text-gold-dark hover:bg-ivory-dark"
          >
            + Ajouter une étape
          </button>
        </div>
      </Section>

      <Section title="Couleurs du thème">
        {[
          ["primaryColor", "Bordeaux (accents)"],
          ["goldColor", "Or"],
          ["backgroundColor", "Fond ivoire"],
          ["textColor", "Texte"],
        ].map(([key, label]) => (
          <Field key={key} label={label}>
            <div className="flex items-center gap-2">
              <input type="color" value={f[key]} onChange={set(key)} className="h-9 w-12 cursor-pointer rounded border border-gold/40" />
              <input className={inputCls} value={f[key]} onChange={set(key)} />
            </div>
          </Field>
        ))}
      </Section>

      <Section title="Textes personnalisés (vide = texte du modèle)">
        <Field label="Titre du hero (FR)">
          <input className={inputCls} placeholder="Wedding Day" value={f.heroTitleFr} onChange={set("heroTitleFr")} />
        </Field>
        <Field label="Titre du hero (AR)">
          <input dir="rtl" className={inputCls} placeholder="يوم الزفاف" value={f.heroTitleAr} onChange={set("heroTitleAr")} />
        </Field>
        <Field label="Titre RSVP (FR)">
          <input className={inputCls} placeholder="Confirmez votre présence" value={f.rsvpTitleFr} onChange={set("rsvpTitleFr")} />
        </Field>
        <Field label="Titre RSVP (AR)">
          <input dir="rtl" className={inputCls} placeholder="أكد حضورك" value={f.rsvpTitleAr} onChange={set("rsvpTitleAr")} />
        </Field>
        <Field label="Sous-titre RSVP (FR — {deadline} = date limite)">
          <input className={inputCls} value={f.rsvpSubtitleFr} onChange={set("rsvpSubtitleFr")} />
        </Field>
        <Field label="Sous-titre RSVP (AR)">
          <input dir="rtl" className={inputCls} value={f.rsvpSubtitleAr} onChange={set("rsvpSubtitleAr")} />
        </Field>
      </Section>

      <Section title="Contact">
        <Field label="Téléphone">
          <input className={inputCls} value={f.phone} onChange={set("phone")} placeholder="+213..." />
        </Field>
        <Field label="WhatsApp">
          <input className={inputCls} value={f.whatsapp} onChange={set("whatsapp")} placeholder="+213..." />
        </Field>
      </Section>

      <Section title="Accès client">
        <Field
          label={
            requirePassword
              ? "Mot de passe du tableau de bord client"
              : "Nouveau mot de passe client (vide = inchangé)"
          }
        >
          <input
            type="text"
            required={requirePassword}
            className={inputCls}
            value={f.dashboardPassword}
            onChange={set("dashboardPassword")}
          />
        </Field>
      </Section>

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-xl bg-burgundy px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white hover:bg-burgundy-dark disabled:opacity-60"
      >
        {busy ? "Enregistrement…" : submitLabel}
      </button>
    </form>
  );
}
