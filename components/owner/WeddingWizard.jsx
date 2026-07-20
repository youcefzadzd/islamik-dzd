"use client";

import { useEffect, useMemo, useState } from "react";
import { EMPTY_PROGRAM_STEP, INVITATION_FIELDS, formToBody } from "./formModel";
import { ownerHeaders } from "./shared";
import { TEMPLATES, getTemplate, DEFAULT_TEMPLATE_ID } from "@/lib/templates";

/* البداية دائمًا باختيار القالب، ثم تتكيف الخطوات مع القالب المختار:
   خطوة «Invitation» (نص الدعوة العائلية) تخص القوالب التي تعرضها فقط */
const INVITATION_TEMPLATES = new Set(["heritage", "floral-romantic"]);

function stepsFor(templateId) {
  return [
    "Modèle",
    "Couple",
    "Détails",
    "Lieu",
    "Médias",
    ...(INVITATION_TEMPLATES.has(templateId) ? ["Invitation"] : []),
    "Programme",
    "Design",
    "Résumé",
  ];
}

const inputCls =
  "w-full rounded-lg border border-gold/40 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-stone-900";
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

/* text input + real file upload to the media library */
function UploadField({ label, value, onChange, accept, placeholder }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function upload(file) {
    setBusy(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/owner/media", {
        method: "POST",
        headers: ownerHeaders(),
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "upload failed");
      onChange(json.url);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sm:col-span-2">
      <label className={labelCls}>{label}</label>
      <div className="flex flex-wrap items-center gap-2">
        <input
          className={`${inputCls} flex-1`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <label className="cursor-pointer rounded-lg border border-gold/50 px-3 py-2 text-sm text-gold-dark hover:bg-ivory-dark">
          {busy ? "Envoi…" : "⇪ Uploader"}
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
        </label>
      </div>
      {err && <p className="mt-1 text-xs text-rose-600">{err}</p>}
    </div>
  );
}

/* ---------- the steps ---------- */

/* الخطوة الأولى: اختيار القالب — بطاقات كبيرة، وكل قالب يغيّر
   الخطوات التالية بما يناسبه */
function StepTemplate({ f, setF }) {
  const selected = f.template || DEFAULT_TEMPLATE_ID;
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink/60">
        Choisissez d&apos;abord le modèle : les étapes suivantes s&apos;adaptent
        automatiquement — chaque modèle a ses propres champs de
        personnalisation.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {TEMPLATES.map((t) =>
          t.status === "live" ? (
            <button
              type="button"
              key={t.id}
              onClick={() => setF((p) => ({ ...p, template: t.id }))}
              className={`rounded-xl border-2 bg-white p-3 text-center transition-colors ${
                selected === t.id ? "border-stone-900 shadow-card" : "border-gold/30 hover:border-gold"
              }`}
            >
              <img src={t.preview} alt="" className="h-36 w-full rounded-lg object-cover" />
              <p className="mt-2 text-base font-semibold text-ink">{t.name}</p>
              <p
                className={`mt-0.5 text-[0.65rem] uppercase tracking-wider ${
                  selected === t.id ? "font-semibold text-stone-900" : "text-gold-dark"
                }`}
              >
                {selected === t.id ? "✓ sélectionné" : "choisir"}
              </p>
            </button>
          ) : (
            <div
              key={t.id}
              className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-gold/40 p-3 text-center text-sm text-ink/40"
            >
              <span className="font-medium">{t.name}</span>
              <span className="text-xs">bientôt</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

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
      <Field label="Nom d'affichage (vide = auto)">
        <input className={inputCls} placeholder="Amine & Fatima" value={f.displayName} onChange={set("displayName")} />
      </Field>
      <Field label="Initiales (ex. A.F)">
        <input className={inputCls} value={f.initials} onChange={set("initials")} />
      </Field>
    </Grid>
  );
}

function StepDetails({ f, set, setF }) {
  return (
    <div className="space-y-5">
      <Grid>
        <Field label="Date du mariage">
          <input type="date" className={inputCls} value={f.weddingDate} onChange={set("weddingDate")} />
        </Field>
        <Field label="Heure">
          <input type="time" className={inputCls} value={f.weddingTime} onChange={set("weddingTime")} />
        </Field>
        <Field label="Date limite RSVP">
          <input type="date" className={inputCls} value={f.rsvpDeadline} onChange={set("rsvpDeadline")} />
        </Field>
        <Field label="Téléphone (contact)">
          <input className={inputCls} value={f.phone} onChange={set("phone")} placeholder="+213..." />
        </Field>
        <Field label="WhatsApp (contact)">
          <input className={inputCls} value={f.whatsapp} onChange={set("whatsapp")} placeholder="+213..." />
        </Field>
      </Grid>

      {/* RSVP companion settings */}
      <div className="rounded-xl border border-gold/30 bg-white/50 p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gold-dark">
          Paramètres RSVP — Accompagnants
        </p>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={f.allowCompanions} onChange={set("allowCompanions")} />
          Autoriser les accompagnants
        </label>
        {f.allowCompanions && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Maximum d'accompagnants adultes (0-10)">
              <input
                type="number"
                min={0}
                max={10}
                className={inputCls}
                value={f.maxAdultCompanions}
                onChange={set("maxAdultCompanions")}
              />
              <p className="mt-1 text-xs text-ink/50">
                0 = aucun · l'invité principal n'est pas compté
              </p>
            </Field>
            <div>
              <label className="mb-2 flex items-center gap-2 pt-1 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={f.childrenAllowed}
                  onChange={set("childrenAllowed")}
                />
                Autoriser les enfants
              </label>
              {f.childrenAllowed && (
                <Field label="Maximum d'enfants (0-10)">
                  <input
                    type="number"
                    min={0}
                    max={10}
                    className={inputCls}
                    value={f.maxChildren}
                    onChange={set("maxChildren")}
                  />
                </Field>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
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

function StepMedia({ f, set, setF }) {
  return (
    <Grid>
      <UploadField
        label="Image du hero (vide = modèle)"
        value={f.heroImage}
        onChange={(v) => setF((p) => ({ ...p, heroImage: v }))}
        accept="image/*"
        placeholder="/assets/hero-background.webp"
      />
      {/* فيديو الهيرو خاصية قالب Heritage وحده */}
      {f.template === "heritage" && (
        <UploadField
          label="Vidéo du hero (mp4, optionnel)"
          value={f.heroVideo}
          onChange={(v) => setF((p) => ({ ...p, heroVideo: v }))}
          accept="video/mp4,video/webm"
          placeholder="https://…/hero.mp4"
        />
      )}
      <UploadField
        label="Image de la page finale"
        value={f.thankYouImage}
        onChange={(v) => setF((p) => ({ ...p, thankYouImage: v }))}
        accept="image/*"
        placeholder="/assets/thankyou-background.webp"
      />
      <div className="sm:col-span-2">
        <label className={labelCls}>Galerie — un chemin par ligne</label>
        <textarea
          rows={4}
          className={`${inputCls} resize-none font-mono text-xs`}
          placeholder={"/assets/gallery/gallery-1.jpg\n/assets/gallery/gallery-2.jpg"}
          value={f.galleryText}
          onChange={set("galleryText")}
        />
        <GalleryUploader
          onUploaded={(url) =>
            setF((p) => ({ ...p, galleryText: (p.galleryText ? p.galleryText + "\n" : "") + url }))
          }
        />
      </div>
      <UploadField
        label="Musique de fond (mp3)"
        value={f.music}
        onChange={(v) => setF((p) => ({ ...p, music: v }))}
        accept="audio/*"
        placeholder="/music/wedding.mp3"
      />
      <UploadField
        label="Son d'ouverture de l'enveloppe (mp3, 1-3s)"
        value={f.openingSound}
        onChange={(v) => setF((p) => ({ ...p, openingSound: v }))}
        accept="audio/*"
        placeholder="/music/opening.mp3"
      />
    </Grid>
  );
}

function GalleryUploader({ onUploaded }) {
  const [busy, setBusy] = useState(false);
  async function upload(files) {
    setBusy(true);
    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/owner/media", { method: "POST", headers: ownerHeaders(), body: fd });
      const json = await res.json();
      if (res.ok) onUploaded(json.url);
    }
    setBusy(false);
  }
  return (
    <label className="mt-2 inline-block cursor-pointer rounded-lg border border-gold/50 px-3 py-1.5 text-sm text-gold-dark hover:bg-ivory-dark">
      {busy ? "Envoi…" : "⇪ Ajouter des photos"}
      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files?.length && upload([...e.target.files])}
      />
    </label>
  );
}

/* Wedding Invitation section (Heritage) — every line is owner-edited,
   one field group per language; nothing is hardcoded in the template */
const INVITATION_LABELS = {
  basmala: "Basmala",
  fatherName: "Nom du père",
  motherName: "Nom de la mère",
  invitationText: "Texte d'invitation",
  mainTitle: "Titre principal",
  brideName: "Nom de la mariée",
  dateIntro: "Intro de la date",
  weddingDate: "Date (texte affiché)",
  time: "Heure (texte affiché)",
  hallIntro: "Intro de la salle",
  hallName: "Nom de la salle",
  footerMessage: "Message de clôture",
};
/* المجموعة العربية: عناوين عربية + مثال توضيحي داخل كل خانة */
const INVITATION_LABELS_AR = {
  basmala: "البسملة",
  fatherName: "اسم الأب",
  motherName: "اسم الأم",
  invitationText: "نص الدعوة",
  mainTitle: "العنوان الرئيسي",
  brideName: "اسم العروس",
  dateIntro: "تمهيد التاريخ",
  weddingDate: "التاريخ (كما سيظهر في الدعوة)",
  time: "التوقيت (كما سيظهر في الدعوة)",
  hallIntro: "تمهيد القاعة",
  hallName: "اسم القاعة",
  footerMessage: "رسالة الختام",
};
const INVITATION_PLACEHOLDERS_AR = {
  basmala: "مثال: بسم الله الرحمن الرحيم",
  fatherName: "مثال: السيد محمد بن أحمد",
  motherName: "مثال: السيدة فاطمة بنت علي",
  invitationText: "مثال: يتشرفان بدعوتكم لحضور حفل زفاف ابنتهما",
  mainTitle: "مثال: حفل زفاف",
  brideName: "مثال: كاتية",
  dateIntro: "مثال: وذلك يوم",
  weddingDate: "مثال: السبت 15 أوت 2026",
  time: "مثال: على الساعة السابعة مساءً",
  hallIntro: "مثال: بقاعة الحفلات",
  hallName: "مثال: قاعة الياسمين — الجزائر العاصمة",
  footerMessage: "مثال: حضوركم يزيد فرحتنا شرفًا وسرورًا",
};
const INVITATION_TEXTAREAS = new Set(["invitationText", "footerMessage"]);

function InvitationGroup({ title, group, rtl, onChange }) {
  const labels = rtl ? INVITATION_LABELS_AR : INVITATION_LABELS;
  const placeholders = rtl ? INVITATION_PLACEHOLDERS_AR : {};
  return (
    <fieldset className="rounded-xl border border-gold/30 bg-white/50 p-4">
      <legend className="px-2 text-sm font-semibold text-ink">{title}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {INVITATION_FIELDS.map((key) => (
          <Field key={key} label={labels[key]} full={INVITATION_TEXTAREAS.has(key)}>
            {INVITATION_TEXTAREAS.has(key) ? (
              <textarea
                dir={rtl ? "rtl" : "ltr"}
                rows={2}
                className={`${inputCls} resize-none`}
                value={group[key] || ""}
                placeholder={placeholders[key]}
                onChange={(e) => onChange(key, e.target.value)}
              />
            ) : (
              <input
                dir={rtl ? "rtl" : "ltr"}
                className={inputCls}
                value={group[key] || ""}
                placeholder={placeholders[key]}
                onChange={(e) => onChange(key, e.target.value)}
              />
            )}
          </Field>
        ))}
      </div>
    </fieldset>
  );
}

function StepInvitation({ f, setF }) {
  const setInv = (groupKey) => (field, value) =>
    setF((prev) => ({
      ...prev,
      [groupKey]: { ...prev[groupKey], [field]: value },
    }));
  return (
    <div className="space-y-5">
      <p className="text-sm text-ink/60">
        Section « Wedding Invitation » de ce modèle : chaque ligne est
        affichée telle quelle selon la langue choisie par l'invité. Les
        champs vides sont masqués.
      </p>

      {/* gender of the celebrated person — one technical value
          (honoree_gender: male | female), the template swaps the phrase
          ابنهما/ابنتهما · leur fils/leur fille accordingly */}
      <fieldset className="rounded-xl border border-gold/30 bg-white/50 p-4">
        <legend className="px-2 text-sm font-semibold text-ink">
          جنس صاحب/صاحبة الدعوة — Genre de la personne célébrée
        </legend>
        <div className="flex flex-wrap gap-4">
          {[
            ["male", "رجل — Homme"],
            ["female", "امرأة — Femme"],
          ].map(([value, label]) => (
            <label key={value} className="flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="radio"
                name="honoreeGender"
                value={value}
                checked={f.honoreeGender === value}
                onChange={() => setF((prev) => ({ ...prev, honoreeGender: value }))}
                className="accent-stone-900"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <InvitationGroup
        title="العربية — Arabic"
        group={f.invitationAr || {}}
        rtl
        onChange={setInv("invitationAr")}
      />
      <InvitationGroup
        title="Français — French"
        group={f.invitationFr || {}}
        rtl={false}
        onChange={setInv("invitationFr")}
      />
    </div>
  );
}

function StepProgram({ f, setF }) {
  const setStep = (i, key, value) =>
    setF((prev) => ({
      ...prev,
      program: prev.program.map((s, j) => (j === i ? { ...s, [key]: value } : s)),
    }));
  return (
    <div className="space-y-3">
      {f.program.map((s, i) => (
        <div key={i} className="rounded-xl border border-gold/30 bg-white/50 p-3">
          <div className="grid grid-cols-[85px_1fr_1fr_36px] items-center gap-2">
            <input type="time" className={inputCls} value={s.time} onChange={(e) => setStep(i, "time", e.target.value)} />
            <input className={inputCls} placeholder="Titre (FR)" value={s.title_fr} onChange={(e) => setStep(i, "title_fr", e.target.value)} />
            <input dir="rtl" className={inputCls} placeholder="العنوان (AR)" value={s.title_ar} onChange={(e) => setStep(i, "title_ar", e.target.value)} />
            <button
              type="button"
              aria-label="Supprimer l'étape"
              onClick={() => setF((prev) => ({ ...prev, program: prev.program.filter((_, j) => j !== i) }))}
              className="rounded-lg border border-stone-400 py-2 text-stone-700 hover:bg-stone-900 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input
              className={`${inputCls} text-xs`}
              placeholder="Description (FR, optionnel)"
              value={s.description_fr || ""}
              onChange={(e) => setStep(i, "description_fr", e.target.value)}
            />
            <input
              dir="rtl"
              className={`${inputCls} text-xs`}
              placeholder="الوصف (AR، اختياري)"
              value={s.description_ar || ""}
              onChange={(e) => setStep(i, "description_ar", e.target.value)}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setF((prev) => ({ ...prev, program: [...prev.program, { ...EMPTY_PROGRAM_STEP }] }))}
        className="rounded-lg border border-gold/50 px-3 py-1.5 text-sm text-gold-dark hover:bg-ivory-dark"
      >
        + Ajouter un événement
      </button>
    </div>
  );
}

/* كلمة السر الافتراضية للعميل: اسم العريس (حروف لاتينية منظّفة)
   + يوم وشهر العرس فقط — مثال: amine1408 */
function suggestedPassword(f) {
  const name = (f.groomName || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
  const d = f.weddingDate || ""; // YYYY-MM-DD
  if (!name || d.length !== 10) return "";
  return `${name}${d.slice(8, 10)}${d.slice(5, 7)}`;
}

function StepDesign({ f, setF, set, requirePassword }) {
  const defaultPassword = useMemo(() => suggestedPassword(f), [f.groomName, f.weddingDate]);

  /* عرس جديد: تُعبّأ تلقائيًا إن كانت الخانة فارغة — في وضع التعديل
     لا نملأ شيئًا حتى لا تتغير كلمة سر العميل دون قصد */
  useEffect(() => {
    if (requirePassword && defaultPassword) {
      setF((p) => (p.dashboardPassword ? p : { ...p, dashboardPassword: defaultPassword }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultPassword, requirePassword]);

  return (
    <div className="space-y-5">
      {/* اختيار القالب انتقل إلى الخطوة الأولى — هنا يبقى تذكير فقط */}
      <p className="text-xs text-ink/50">
        Modèle choisi : <span className="font-semibold text-ink">{getTemplate(f.template)?.name || "Islamic Royal"}</span> — modifiable à la première étape.
      </p>

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
        <Field label="Typographie">
          <select className={inputCls} disabled>
            <option>Classique (Playfair · Amiri · Pinyon)</option>
          </select>
        </Field>
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
        <Field
          label={requirePassword ? "Mot de passe du client *" : "Nouveau mot de passe client (vide = inchangé)"}
          full
        >
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              className={`${inputCls} flex-1`}
              value={f.dashboardPassword}
              onChange={set("dashboardPassword")}
            />
            <button
              type="button"
              disabled={!defaultPassword}
              onClick={() => setF((p) => ({ ...p, dashboardPassword: defaultPassword }))}
              className="rounded-lg border border-gold/50 px-3 py-2 text-sm text-gold-dark transition-colors hover:bg-ivory-dark disabled:opacity-40"
            >
              🎲 Générer
            </button>
          </div>
          <p className="mt-1 text-xs text-ink/50">
            Générée automatiquement : prénom du marié + jour et mois du mariage
            {defaultPassword ? ` (${defaultPassword})` : " — renseignez le prénom et la date d'abord"}
          </p>
        </Field>
      </Grid>
    </div>
  );
}

function Review({ f, requirePassword }) {
  const rows = [
    ["Couple", `${f.groomName} & ${f.brideName}${f.groomNameAr ? ` (${f.groomNameAr} و ${f.brideNameAr})` : ""}`],
    ["Nom d'affichage", f.displayName || `${f.groomName} & ${f.brideName}`],
    ["Date", [f.weddingDate, f.weddingTime].filter(Boolean).join(" · ") || "—"],
    ["Date limite RSVP", f.rsvpDeadline || "—"],
    [
      "Accompagnants RSVP",
      f.allowCompanions
        ? `${parseInt(f.maxAdultCompanions, 10) || 0} adulte(s) max · ${
            f.childrenAllowed
              ? `${parseInt(f.maxChildren, 10) || 0} enfant(s) max`
              : "enfants non autorisés"
          }`
        : "désactivés",
    ],
    ["Lieu", [f.locationName, f.address].filter(Boolean).join(", ") || "—"],
    ["Google Maps", f.googleMapsUrl || "—"],
    ["Hero", f.heroImage || "modèle par défaut"],
    [
      "Invitation (texte)",
      Object.values(f.invitationAr || {}).some((v) => (v || "").trim()) ||
      Object.values(f.invitationFr || {}).some((v) => (v || "").trim())
        ? "personnalisée ✓"
        : "—",
    ],
    ["Galerie", `${f.galleryText.split("\n").filter((s) => s.trim()).length || "modèle"} photo(s)`],
    ["Musique", f.music || "modèle par défaut"],
    ["Son d'ouverture", f.openingSound || "modèle par défaut"],
    ["Programme", `${f.program.filter((s) => s.time && (s.title_fr || s.title_ar)).length} événement(s)`],
    ["Modèle", getTemplate(f.template)?.name || "Islamic Royal"],
    ["Couleurs", `${f.primaryColor} · ${f.goldColor} · ${f.backgroundColor}`],
    ["Langues", [f.langFr && "FR", f.langAr && "AR"].filter(Boolean).join(" · ") + ` (défaut : ${f.defaultLanguage.toUpperCase()})`],
    ["Contact", [f.phone, f.whatsapp].filter(Boolean).join(" · ") || "—"],
    ["Mot de passe client", f.dashboardPassword ? "✓ défini" : requirePassword ? "⚠ manquant" : "inchangé"],
  ];
  return (
    <dl className="divide-y divide-gold/15 rounded-xl border border-gold/30 bg-white/50">
      {rows.map(([k, v]) => (
        <div key={k} className="flex flex-wrap gap-2 px-4 py-2.5 text-sm">
          <dt className="w-44 shrink-0 text-ink/55">{k}</dt>
          <dd className="min-w-0 flex-1 break-words text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------- the wizard shell ---------- */

export default function WeddingWizard({ initial, onFinish, finishLabel, requirePassword, busy, error }) {
  const [step, setStep] = useState(0);
  const [f, setF] = useState(initial);
  const [stepError, setStepError] = useState("");

  /* الخطوات تُشتق من القالب المختار في الخطوة الأولى */
  const steps = stepsFor(f.template || DEFAULT_TEMPLATE_ID);
  const current = steps[step];

  const set = (key) => (e) =>
    setF((prev) => ({
      ...prev,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  function validate(name) {
    if (name === "Couple" && (!f.groomName.trim() || !f.brideName.trim()))
      return "Les deux prénoms (FR) sont obligatoires.";
    if (name === "Invitation" && f.template === "heritage") {
      /* Heritage: the parents' names are mandatory in BOTH language
         groups — the invitation must never publish without them */
      const empty = (v) => !(typeof v === "string" && v.trim());
      if (empty(f.invitationAr?.fatherName)) return "اسم الأب مطلوب";
      if (empty(f.invitationAr?.motherName)) return "اسم الأم مطلوب";
      if (empty(f.invitationFr?.fatherName)) return "Le nom du père est obligatoire";
      if (empty(f.invitationFr?.motherName)) return "Le nom de la mère est obligatoire";
    }
    if (name === "Design" && requirePassword && !f.dashboardPassword)
      return "Le mot de passe du client est obligatoire.";
    if (name === "Design" && !f.langFr && !f.langAr) return "Activez au moins une langue.";
    return "";
  }

  function next() {
    const err = validate(current);
    if (err) return setStepError(err);
    setStepError("");
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function finish() {
    const err = validate("Couple") || validate("Invitation") || validate("Design");
    if (err) return setStepError(err);
    setStepError("");
    onFinish(formToBody(f));
  }

  return (
    <div className="rounded-2xl border border-gold/25 bg-white/60 p-4 shadow-card backdrop-blur-md sm:p-6">
      {/* progress indicator */}
      <ol className="mb-6 flex items-center justify-between gap-1 overflow-x-auto">
        {steps.map((label, i) => (
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
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-gold/40 bg-white text-ink/50"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </span>
              <span
                className={`hidden text-[0.62rem] uppercase tracking-wider lg:block ${
                  i === step ? "text-stone-700" : "text-ink/50"
                }`}
              >
                {label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <span className={`mx-1 h-px flex-1 ${i < step ? "bg-gold" : "bg-gold/30"}`} />
            )}
          </li>
        ))}
      </ol>

      <h2 className="mb-4 text-lg font-semibold text-ink lg:hidden">
        {step + 1}. {current}
      </h2>

      {current === "Modèle" && <StepTemplate f={f} setF={setF} />}
      {current === "Couple" && <StepCouple f={f} set={set} />}
      {current === "Détails" && <StepDetails f={f} set={set} setF={setF} />}
      {current === "Lieu" && <StepVenue f={f} set={set} />}
      {current === "Médias" && <StepMedia f={f} set={set} setF={setF} />}
      {current === "Invitation" && <StepInvitation f={f} setF={setF} />}
      {current === "Programme" && <StepProgram f={f} setF={setF} />}
      {current === "Design" && <StepDesign f={f} setF={setF} set={set} requirePassword={requirePassword} />}
      {current === "Résumé" && <Review f={f} requirePassword={requirePassword} />}

      {(stepError || error) && <p className="mt-4 text-sm text-rose-600">{stepError || error}</p>}

      {/* previous / next / finish */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-xl border border-gold/50 px-5 py-2.5 text-sm text-gold-dark transition-colors hover:bg-ivory-dark disabled:opacity-40"
        >
          ← Précédent
        </button>
        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="rounded-xl bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-stone-700"
          >
            Suivant →
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            disabled={busy}
            className="rounded-xl bg-stone-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-stone-700 disabled:opacity-60"
          >
            {busy ? "Enregistrement…" : finishLabel}
          </button>
        )}
      </div>
    </div>
  );
}
