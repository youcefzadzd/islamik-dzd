"use client";

/**
 * استمارة معلومات العرس — /infos
 * يملؤها العميل بعد الاتفاق (أو يُرسل له الرابط على واتساب)، وعند
 * الإرسال تُفتح محادثة واتساب النشاط برسالة منسّقة تحوي كل التفاصيل
 * اللازمة لتجهيز الدعوة. لا تُكتب أي بيانات في قاعدة البيانات —
 * الوجهة الوحيدة هي واتساب.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CATALOG, PRICING, SITE, whatsappLink } from "./site-config";
import { WhatsAppIcon } from "./ui";
import { useSiteWhatsApp } from "./useSiteWhatsApp";
import Pixels from "./Pixels";

const LANG_KEY = "dawati-site-lang";
const LIVE_TEMPLATES = CATALOG.filter((c) => !c.comingSoon);

const COPY = {
  ar: {
    dir: "rtl",
    title: "استمارة معلومات العرس",
    subtitle:
      "املآ المعلومات التالية بدقة — نستعملها لتجهيز دعوتكما كما تتمنيانها. عند الإرسال تصلنا مباشرة على واتساب.",
    sections: {
      couple: "العروسان",
      family: "العائلة (اختياري)",
      event: "الحفل",
      design: "الدعوة",
      extra: "تفاصيل إضافية (اختياري)",
      contact: "التواصل",
    },
    groomFr: "اسم العريس (بالأحرف اللاتينية)",
    groomAr: "اسم العريس بالعربية",
    brideFr: "اسم العروس (بالأحرف اللاتينية)",
    brideAr: "اسم العروس بالعربية",
    honoree: "الدعوة باسم من؟",
    honoreeGroom: "العريس (عائلة العريس)",
    honoreeBride: "العروس (عائلة العروس)",
    father: "اسم الأب (يظهر في نص الدعوة)",
    mother: "اسم الأم (اختياري)",
    date: "تاريخ الزفاف",
    time: "ساعة الاستقبال",
    venue: "اسم القاعة",
    address: "العنوان أو المدينة",
    maps: "رابط موقع القاعة في خرائط Google (اختياري)",
    template: "القالب المفضل",
    pack: "الباقة",
    pickTemplate: "اختر القالب…",
    pickPack: "اختر الباقة…",
    program: "برنامج اليوم (استقبال، عشاء، سهرة… مع الأوقات)",
    programPh: "مثال:\n16:00 استقبال الضيوف\n19:00 العشاء\n21:00 السهرة",
    notes: "هاشتاغ، أغنية مفضلة، أو أي طلب خاص",
    notesPh: "مثال: #Amine_Fatima — موسيقى هادئة عند الفتح…",
    phone: "رقم هاتفكما (للتواصل)",
    phonePh: "0550123456",
    send: "أرسلا المعلومات",
    sending: "جارٍ الإرسال…",
    required: "المرجو ملء الحقول الأساسية: اسما العروسين والهاتف.",
    hint: "تصل المعلومات مباشرة إلى فريق Dawati وسنتواصل معكما قريبًا.",
    doneTitle: "وصلت معلوماتكما 🌹",
    doneText:
      "شكرًا لكما! استلم فريقنا كل التفاصيل وسنبدأ تجهيز دعوتكما، ثم نتواصل معكما على الرقم الذي أدخلتماه.",
    doneWa: "أرسلا نسخة على واتساب أيضًا",
    doneBack: "العودة إلى الموقع",
  },
  fr: {
    dir: "ltr",
    title: "Fiche d'informations du mariage",
    subtitle:
      "Remplissez ces informations avec précision — elles servent à préparer votre invitation. À l'envoi, tout nous arrive directement sur WhatsApp.",
    sections: {
      couple: "Les mariés",
      family: "La famille (optionnel)",
      event: "La fête",
      design: "L'invitation",
      extra: "Détails supplémentaires (optionnel)",
      contact: "Contact",
    },
    groomFr: "Prénom du marié (lettres latines)",
    groomAr: "Prénom du marié en arabe",
    brideFr: "Prénom de la mariée (lettres latines)",
    brideAr: "Prénom de la mariée en arabe",
    honoree: "L'invitation au nom de qui ?",
    honoreeGroom: "Le marié (famille du marié)",
    honoreeBride: "La mariée (famille de la mariée)",
    father: "Prénom du père (affiché dans l'invitation)",
    mother: "Prénom de la mère (optionnel)",
    date: "Date du mariage",
    time: "Heure d'accueil",
    venue: "Nom de la salle",
    address: "Adresse ou ville",
    maps: "Lien Google Maps de la salle (optionnel)",
    template: "Template préféré",
    pack: "Pack",
    pickTemplate: "Choisir le template…",
    pickPack: "Choisir le pack…",
    program: "Programme de la journée (accueil, dîner, soirée… avec horaires)",
    programPh: "Ex :\n16:00 Accueil des invités\n19:00 Dîner\n21:00 Soirée",
    notes: "Hashtag, musique préférée, ou demande spéciale",
    notesPh: "Ex : #Amine_Fatima — musique douce à l'ouverture…",
    phone: "Votre numéro (pour vous joindre)",
    phonePh: "0550123456",
    send: "Envoyer les informations",
    sending: "Envoi en cours…",
    required: "Merci de remplir l'essentiel : prénoms des mariés et téléphone.",
    hint: "Vos informations arrivent directement à l'équipe Dawati — nous vous recontactons très vite.",
    doneTitle: "Informations bien reçues 🌹",
    doneText:
      "Merci ! Notre équipe a reçu tous les détails et commence à préparer votre invitation. Nous vous recontactons au numéro indiqué.",
    doneWa: "Envoyer aussi une copie sur WhatsApp",
    doneBack: "Retour au site",
  },
};

const inputCls =
  "w-full rounded-xl border border-gold/35 bg-cream px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-burgundy/60";
const labelCls =
  "mb-1.5 block text-[0.78rem] font-semibold text-ink/60";

function Field({ label, children }) {
  return (
    <div>
      <span className={labelCls}>{label}</span>
      {children}
    </div>
  );
}

export default function WeddingInfoForm() {
  const [lang, setLang] = useState("ar");
  const t = COPY[lang];
  const font = lang === "ar" ? "font-arabicText" : "font-body";
  const waNumber = useSiteWhatsApp();

  const [f, setF] = useState({
    groomFr: "", groomAr: "", brideFr: "", brideAr: "",
    honoree: "groom", father: "", mother: "",
    date: "", time: "", venue: "", address: "", maps: "",
    template: "", pack: "",
    program: "", notes: "", phone: "",
  });
  const [err, setErr] = useState(false);
  const [state, setState] = useState("idle"); // idle | sending | done

  useEffect(() => {
    const saved = window.localStorage.getItem(LANG_KEY);
    if (saved === "fr" || saved === "ar") setLang(saved);
  }, []);

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  /* رسالة واتساب المنسّقة — تُستعمل احتياطًا وفي زر "نسخة على واتساب" */
  const buildWaLink = () => {
    const tpl = LIVE_TEMPLATES.find((c) => c.id === f.template);
    const pk = PRICING.find((p) => p.id === f.pack);
    const L = (ar, fr) => (lang === "ar" ? ar : fr);
    const lines = [
      L("🌹 استمارة معلومات العرس — Dawati", "🌹 Fiche mariage — Dawati"),
      "",
      L("🤵 العريس:", "🤵 Marié :") + ` ${f.groomFr.trim()}${f.groomAr.trim() ? ` (${f.groomAr.trim()})` : ""}`,
      L("👰 العروس:", "👰 Mariée :") + ` ${f.brideFr.trim()}${f.brideAr.trim() ? ` (${f.brideAr.trim()})` : ""}`,
      L("📜 الدعوة باسم:", "📜 Invitation au nom de :") +
        " " + (f.honoree === "bride" ? L("العروس", "la mariée") : L("العريس", "le marié")),
      f.father.trim() ? L("👨 الأب:", "👨 Père :") + ` ${f.father.trim()}` : null,
      f.mother.trim() ? L("👩 الأم:", "👩 Mère :") + ` ${f.mother.trim()}` : null,
      "",
      f.date ? L("📅 التاريخ:", "📅 Date :") + ` ${f.date}` : null,
      f.time ? L("🕰 الساعة:", "🕰 Heure :") + ` ${f.time}` : null,
      f.venue.trim() ? L("🏛 القاعة:", "🏛 Salle :") + ` ${f.venue.trim()}` : null,
      f.address.trim() ? L("📍 العنوان:", "📍 Adresse :") + ` ${f.address.trim()}` : null,
      f.maps.trim() ? L("🗺 الخريطة:", "🗺 Maps :") + ` ${f.maps.trim()}` : null,
      "",
      tpl ? L("🎨 القالب:", "🎨 Template :") + ` ${tpl.name}` : null,
      pk ? L("💎 الباقة:", "💎 Pack :") + ` ${pk.name[lang]}` : null,
      f.program.trim() ? "" : null,
      f.program.trim() ? L("📋 البرنامج:", "📋 Programme :") + `\n${f.program.trim()}` : null,
      f.notes.trim() ? "" : null,
      f.notes.trim() ? L("✨ طلبات خاصة:", "✨ Demandes :") + `\n${f.notes.trim()}` : null,
      "",
      L("📞 الهاتف:", "📞 Téléphone :") + ` ${f.phone.trim()}`,
    ].filter((x) => x !== null);
    return whatsappLink(lines.join("\n"), waNumber);
  };

  const submit = async () => {
    if (f.groomFr.trim().length < 2 || f.brideFr.trim().length < 2 || f.phone.trim().length < 8) {
      setErr(true);
      return;
    }
    setErr(false);
    setState("sending");
    /* الوجهة الأساسية: لوحة التحكم (client_infos) — واتساب احتياط فقط */
    let saved = false;
    try {
      const res = await fetch("/api/site/infos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, lang }),
      });
      saved = res.ok;
    } catch {}
    if (!saved) {
      const link = buildWaLink();
      if (link) window.open(link, "_blank", "noopener,noreferrer");
    }
    setState("done");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div dir={t.dir} lang={lang} className={`min-h-screen bg-ivory text-ink ${font}`}>
      <Pixels />
      {/* شريط علوي مبسّط */}
      <header className="border-b border-gold/15 bg-ivory/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3.5">
          <a href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/50 bg-cream font-monogram text-lg text-burgundy shadow-sm">
              {SITE.brandName.charAt(0)}
            </span>
            <span className="font-serif text-base font-bold text-burgundy-dark">
              {SITE.brandName}
            </span>
          </a>
          <div className="flex overflow-hidden rounded-full border border-gold/40 bg-cream text-xs font-semibold shadow-sm">
            {["ar", "fr"].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  setLang(l);
                  window.localStorage.setItem(LANG_KEY, l);
                }}
                className={`px-3.5 py-1.5 transition-colors ${
                  lang === l ? "bg-burgundy text-cream" : "text-burgundy/70 hover:bg-ivory-light"
                } ${l === "ar" ? "font-arabicText" : ""}`}
              >
                {l === "ar" ? "عربي" : "FR"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-20 pt-10">
        {state === "done" ? (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-gold/25 bg-cream p-8 text-center shadow-card"
          >
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald/10 text-3xl">
              ✓
            </span>
            <h1 className={`mt-5 text-2xl font-bold text-burgundy-dark ${lang === "ar" ? "font-arabicText" : "font-serif"}`}>
              {t.doneTitle}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink/65">{t.doneText}</p>
            <div className="mt-7 flex flex-col items-center gap-3">
              {buildWaLink() ? (
                <a
                  href={buildWaLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#25D366] px-7 py-3 text-sm font-bold text-white shadow transition-all hover:-translate-y-0.5"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  {t.doneWa}
                </a>
              ) : null}
              <a href="/" className="text-sm text-ink/55 underline-offset-4 hover:text-burgundy hover:underline">
                {t.doneBack}
              </a>
            </div>
          </motion.div>
        ) : (
        <>
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className={`text-3xl font-bold text-burgundy-dark ${lang === "ar" ? "font-arabicText" : "font-serif"}`}>
            {t.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink/65">{t.subtitle}</p>
        </motion.div>

        <div className="mt-8 space-y-8">
          {/* العروسان */}
          <section className="rounded-2xl border border-gold/25 bg-cream p-5 shadow-card">
            <h2 className="mb-4 font-serif text-lg font-semibold text-burgundy-dark">{t.sections.couple}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.groomFr}><input value={f.groomFr} onChange={set("groomFr")} className={inputCls} /></Field>
              <Field label={t.groomAr}><input value={f.groomAr} onChange={set("groomAr")} dir="rtl" className={inputCls} /></Field>
              <Field label={t.brideFr}><input value={f.brideFr} onChange={set("brideFr")} className={inputCls} /></Field>
              <Field label={t.brideAr}><input value={f.brideAr} onChange={set("brideAr")} dir="rtl" className={inputCls} /></Field>
            </div>
            <div className="mt-4">
              <span className={labelCls}>{t.honoree}</span>
              <div className="flex gap-2.5">
                {[
                  ["groom", t.honoreeGroom],
                  ["bride", t.honoreeBride],
                ].map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setF((p) => ({ ...p, honoree: v }))}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                      f.honoree === v
                        ? "border-burgundy bg-burgundy text-cream"
                        : "border-gold/40 bg-cream text-ink/70 hover:border-burgundy/50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* العائلة */}
          <section className="rounded-2xl border border-gold/25 bg-cream p-5 shadow-card">
            <h2 className="mb-4 font-serif text-lg font-semibold text-burgundy-dark">{t.sections.family}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.father}><input value={f.father} onChange={set("father")} className={inputCls} /></Field>
              <Field label={t.mother}><input value={f.mother} onChange={set("mother")} className={inputCls} /></Field>
            </div>
          </section>

          {/* الحفل */}
          <section className="rounded-2xl border border-gold/25 bg-cream p-5 shadow-card">
            <h2 className="mb-4 font-serif text-lg font-semibold text-burgundy-dark">{t.sections.event}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.date}><input type="date" value={f.date} onChange={set("date")} className={inputCls} /></Field>
              <Field label={t.time}><input type="time" value={f.time} onChange={set("time")} className={inputCls} /></Field>
              <Field label={t.venue}><input value={f.venue} onChange={set("venue")} className={inputCls} /></Field>
              <Field label={t.address}><input value={f.address} onChange={set("address")} className={inputCls} /></Field>
            </div>
            <div className="mt-4">
              <Field label={t.maps}><input value={f.maps} onChange={set("maps")} dir="ltr" inputMode="url" className={inputCls} /></Field>
            </div>
          </section>

          {/* الدعوة */}
          <section className="rounded-2xl border border-gold/25 bg-cream p-5 shadow-card">
            <h2 className="mb-4 font-serif text-lg font-semibold text-burgundy-dark">{t.sections.design}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t.template}>
                <select value={f.template} onChange={set("template")} className={inputCls}>
                  <option value="">{t.pickTemplate}</option>
                  {LIVE_TEMPLATES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label={t.pack}>
                <select value={f.pack} onChange={set("pack")} className={inputCls}>
                  <option value="">{t.pickPack}</option>
                  {PRICING.map((p) => (
                    <option key={p.id} value={p.id}>{p.name[lang]}</option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          {/* تفاصيل إضافية */}
          <section className="rounded-2xl border border-gold/25 bg-cream p-5 shadow-card">
            <h2 className="mb-4 font-serif text-lg font-semibold text-burgundy-dark">{t.sections.extra}</h2>
            <div className="space-y-4">
              <Field label={t.program}>
                <textarea value={f.program} onChange={set("program")} placeholder={t.programPh} rows={4} className={inputCls} />
              </Field>
              <Field label={t.notes}>
                <textarea value={f.notes} onChange={set("notes")} placeholder={t.notesPh} rows={3} className={inputCls} />
              </Field>
            </div>
          </section>

          {/* التواصل + الإرسال */}
          <section className="rounded-2xl border border-gold/25 bg-cream p-5 shadow-card">
            <h2 className="mb-4 font-serif text-lg font-semibold text-burgundy-dark">{t.sections.contact}</h2>
            <Field label={t.phone}>
              <input value={f.phone} onChange={set("phone")} placeholder={t.phonePh} dir="ltr" inputMode="tel" className={inputCls} />
            </Field>
            {err ? <p className="mt-3 text-sm text-rose-600">{t.required}</p> : null}
            <button
              type="button"
              disabled={state === "sending"}
              onClick={submit}
              className="mt-5 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-burgundy px-7 py-3.5 text-sm font-bold text-cream shadow transition-all duration-300 hover:-translate-y-0.5 hover:bg-burgundy-dark disabled:opacity-60 sm:w-auto"
            >
              {state === "sending" ? t.sending : t.send}
              <span aria-hidden>{lang === "ar" ? "←" : "→"}</span>
            </button>
            <p className="mt-3 text-xs leading-relaxed text-ink/45">{t.hint}</p>
          </section>
        </div>
        </>
        )}
      </main>
    </div>
  );
}
