"use client";

import { useState } from "react";
import { EMPTY_PROGRAM_STEP, formToBody } from "./formModel";

const STEPS = ["Couple", "Lieu", "Médias", "Programme", "Réglages"];

const inputCls =
  "w-full rounded-lg border border-gold/40 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-burgundy";
const labelCls = "mb-1 block text-xs font-medium uppercase tracking-wider text-ink/60";

function Field({ label, children, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

/* ---------- the five steps ---------- */

function StepCouple({ f, set }) {
  return (
    <Grid>
      <Field label="Marié (FR) *">
        <input required className={inputCls} value={f.groomName} onChange={set("groomName")} />
      </Field>
      <Field label="Mariée (FR) *">
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
      <div />
      <Field label="Date du mariage">
        <input type="date" className={inputCls} value={f.weddingDate} onChange={set("weddingDate")} />
      </Field>
      <Field label="Heure">
        <input type="time" className={inputCls} value={f.weddingTime} onChange={set("weddingTime")} />
      </Field>
      <Field label="Date limite RSVP">
        <input type="date" className={inputCls} value={f.rsvpDeadline} onChange={set("rsvpDeadline")} />
      </Field>
    </Grid>
  );
}

function StepVenue({ f, set }) {
  return (
    <Grid>
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
      <Field label="Lien Google Maps" full>
        <input className={inputCls} value={f.googleMapsUrl} onChange={set("googleMapsUrl")} />
      </Field>
      <Field label="Carte intégrée (embed URL, optionnel)" full>
        <input className={inputCls} value={f.mapEmbedUrl} onChange={set("mapEmbedUrl")} />
      </Field>
    </Grid>
  );
}

function StepMedia({ f, set }) {
  return (
    <Grid>
      <Field label="Image du hero (vide = modèle)" full>
        <input className={inputCls} placeholder="/assets/hero-background.webp" value={f.heroImage} onChange={set("heroImage")} />
      </Field>
      <Field label="Image de la page finale" full>
        <input className={inputCls} placeholder="/assets/thankyou-background.webp" value={f.thankYouImage} onChange={set("thankYouImage")} />
      </Field>
      <Field label="Galerie — un chemin par ligne" full>
        <textarea
          rows={4}
          className={`${inputCls} resize-none font-mono text-xs`}
          placeholder={"/assets/gallery/gallery-1.jpg\n/assets/gallery/gallery-2.jpg"}
          value={f.galleryText}
          onChange={set("galleryText")}
        />
      </Field>
      <Field label="Musique (mp3)" full>
        <input className={inputCls} placeholder="/music/wedding.mp3" value={f.music} onChange={set("music")} />
      </Field>
      <p className="text-xs text-ink/55 sm:col-span-2">
        Les fichiers doivent exister dans <code>public/</code> du site déployé.
        Laissez vide pour garder les visuels du modèle.
      </p>
    </Grid>
  );
}

function StepProgram({ f, setF }) {
  const setStep = (i, key, value) =>
    setF((prev) => ({
      ...prev,
      program: prev.program.map((s, j) => (j === i ? { ...s, [key]: value } : s)),
    }));
  return (
    <div className="space-y-2">
      {f.program.map((s, i) => (
        <div key={i} className="grid grid-cols-[85px_1fr_1fr_36px] items-center gap-2">
          <input type="time" className={inputCls} value={s.time} onChange={(e) => setStep(i, "time", e.target.value)} />
          <input className={inputCls} placeholder="Titre (FR)" value={s.title_fr} onChange={(e) => setStep(i, "title_fr", e.target.value)} />
          <input dir="rtl" className={inputCls} placeholder="العنوان (AR)" value={s.title_ar} onChange={(e) => setStep(i, "title_ar", e.target.value)} />
          <button
            type="button"
            aria-label="Supprimer l'étape"
            onClick={() => setF((prev) => ({ ...prev, program: prev.program.filter((_, j) => j !== i) }))}
            className="rounded-lg border border-burgundy/40 py-2 text-burgundy hover:bg-burgundy hover:text-white"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setF((prev) => ({ ...prev, program: [...prev.program, { ...EMPTY_PROGRAM_STEP }] }))}
        className="rounded-lg border border-gold/50 px-3 py-1.5 text-sm text-gold-dark hover:bg-ivory-dark"
      >
        + Ajouter une étape
      </button>
    </div>
  );
}

function StepSettings({ f, set, requirePassword }) {
  return (
    <div className="space-y-4">
      <Grid>
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
      </Grid>
      <Grid>
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
      </Grid>
      <Grid>
        <Field label="Titre du hero (FR)">
          <input className={inputCls} placeholder="Wedding Day" value={f.heroTitleFr} onChange={set("heroTitleFr")} />
        </Field>
        <Field label="Titre du hero (AR)">
          <input dir="rtl" className={inputCls} placeholder="يوم الزفاف" value={f.heroTitleAr} onChange={set("heroTitleAr")} />
        </Field>
        <Field label="Titre RSVP (FR)">
          <input className={inputCls} value={f.rsvpTitleFr} onChange={set("rsvpTitleFr")} />
        </Field>
        <Field label="Titre RSVP (AR)">
          <input dir="rtl" className={inputCls} value={f.rsvpTitleAr} onChange={set("rsvpTitleAr")} />
        </Field>
        <Field label="Sous-titre RSVP (FR — {deadline} = date limite)">
          <input className={inputCls} value={f.rsvpSubtitleFr} onChange={set("rsvpSubtitleFr")} />
        </Field>
        <Field label="Sous-titre RSVP (AR)">
          <input dir="rtl" className={inputCls} value={f.rsvpSubtitleAr} onChange={set("rsvpSubtitleAr")} />
        </Field>
      </Grid>
      <Grid>
        <Field label="Téléphone">
          <input className={inputCls} value={f.phone} onChange={set("phone")} placeholder="+213..." />
        </Field>
        <Field label="WhatsApp">
          <input className={inputCls} value={f.whatsapp} onChange={set("whatsapp")} placeholder="+213..." />
        </Field>
        <Field
          label={requirePassword ? "Mot de passe du client *" : "Nouveau mot de passe client (vide = inchangé)"}
          full
        >
          <input type="text" className={inputCls} value={f.dashboardPassword} onChange={set("dashboardPassword")} />
        </Field>
      </Grid>
    </div>
  );
}

/* ---------- the wizard shell ---------- */

export default function WeddingWizard({ initial, onFinish, finishLabel, requirePassword, busy, error }) {
  const [step, setStep] = useState(0);
  const [f, setF] = useState(initial);
  const [stepError, setStepError] = useState("");

  const set = (key) => (e) =>
    setF((prev) => ({
      ...prev,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  function validate(i) {
    if (i === 0 && (!f.groomName.trim() || !f.brideName.trim()))
      return "Les deux prénoms (FR) sont obligatoires.";
    if (i === 4 && requirePassword && !f.dashboardPassword)
      return "Le mot de passe du client est obligatoire.";
    if (i === 4 && !f.langFr && !f.langAr) return "Activez au moins une langue.";
    return "";
  }

  function next() {
    const err = validate(step);
    if (err) return setStepError(err);
    setStepError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function finish() {
    const err = validate(0) || validate(4);
    if (err) return setStepError(err);
    setStepError("");
    onFinish(formToBody(f));
  }

  return (
    <div className="rounded-2xl border border-gold/30 bg-ivory-light p-4 shadow-card sm:p-6">
      {/* progress indicator */}
      <ol className="mb-6 flex items-center justify-between gap-1">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-1 last:flex-none">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              className="flex flex-col items-center gap-1"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
                  i < step
                    ? "border-gold bg-gold text-white"
                    : i === step
                      ? "border-burgundy bg-burgundy text-white"
                      : "border-gold/40 bg-white text-ink/50"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </span>
              <span
                className={`hidden text-[0.65rem] uppercase tracking-wider sm:block ${
                  i === step ? "text-burgundy" : "text-ink/50"
                }`}
              >
                {label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <span className={`mx-1 h-px flex-1 ${i < step ? "bg-gold" : "bg-gold/30"}`} />
            )}
          </li>
        ))}
      </ol>

      <h2 className="mb-4 text-lg font-semibold text-ink sm:hidden">
        {step + 1}. {STEPS[step]}
      </h2>

      {step === 0 && <StepCouple f={f} set={set} />}
      {step === 1 && <StepVenue f={f} set={set} />}
      {step === 2 && <StepMedia f={f} set={set} />}
      {step === 3 && <StepProgram f={f} setF={setF} />}
      {step === 4 && <StepSettings f={f} set={set} requirePassword={requirePassword} />}

      {(stepError || error) && (
        <p className="mt-4 text-sm text-burgundy">{stepError || error}</p>
      )}

      {/* previous / next / finish */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-xl border border-gold/50 px-5 py-2.5 text-sm text-gold-dark hover:bg-ivory-dark disabled:opacity-40"
        >
          ← Précédent
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="rounded-xl bg-burgundy px-6 py-2.5 text-sm font-semibold text-white hover:bg-burgundy-dark"
          >
            Suivant →
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            disabled={busy}
            className="rounded-xl bg-burgundy px-6 py-2.5 text-sm font-semibold text-white hover:bg-burgundy-dark disabled:opacity-60"
          >
            {busy ? "Enregistrement…" : finishLabel}
          </button>
        )}
      </div>
    </div>
  );
}
