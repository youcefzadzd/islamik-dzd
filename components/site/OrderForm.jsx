"use client";

/**
 * صفحة طلب الدعوة — /site/order
 * معالج من ثلاث خطوات:
 *   1. اختيار القالب (فيديو الافتتاح يعمل كـ GIF، وصورة متحركة إن لم يوجد فيديو)
 *   2. تفاصيل الحفل (العريس، العروس، التاريخ، المكان، الهاتف)
 *   3. اختيار الباقة مع السعر ثم الإرسال إلى site_orders عبر /api/site/orders
 * ?template= يقفز مباشرة للخطوة 2، و ?pack= يحدد الباقة مسبقًا.
 */

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CATALOG, PRICING, SITE, formatDZD, whatsappLink } from "./site-config";
import { COPY } from "./site-copy";
import { CheckIcon, WhatsAppIcon } from "./ui";
import { useSiteWhatsApp } from "./useSiteWhatsApp";

const LANG_KEY = "dawati-site-lang";
const LIVE_TEMPLATES = CATALOG.filter((c) => !c.comingSoon);

export default function OrderForm() {
  const params = useSearchParams();
  const [lang, setLang] = useState("ar");
  const t = COPY[lang];
  const o = t.order;
  const arabic = lang === "ar";
  const font = arabic ? "font-arabicText" : "font-body";

  const [step, setStep] = useState(1);
  const [templateId, setTemplateId] = useState("");
  const [groom, setGroom] = useState("");
  const [bride, setBride] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [phone, setPhone] = useState("");
  const [packId, setPackId] = useState("");
  const [state, setState] = useState("idle"); // idle | sending | done | error
  const [fieldError, setFieldError] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(LANG_KEY);
    if (saved === "fr" || saved === "ar") setLang(saved);
  }, []);

  // ?template= يحدد القالب ويقفز للخطوة 2 — ?pack= يحدد الباقة مسبقًا
  useEffect(() => {
    const tpl = params.get("template") || "";
    if (LIVE_TEMPLATES.some((c) => c.id === tpl)) {
      setTemplateId(tpl);
      setStep(2);
    }
    const pk = params.get("pack") || "";
    if (PRICING.some((p) => p.id === pk)) setPackId(pk);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchLang = (next) => {
    setLang(next);
    window.localStorage.setItem(LANG_KEY, next);
  };

  const chosen = LIVE_TEMPLATES.find((c) => c.id === templateId) || null;
  const pack = PRICING.find((p) => p.id === packId) || null;

  const goTo = (s) => {
    setFieldError("");
    setStep(s);
  };

  const pickTemplate = (id) => {
    setTemplateId(id);
    goTo(2);
  };

  // التاريخ والمكان اختياريان — يُرسلان فارغين إن لم يُدخلا
  const validateDetails = () => {
    if (groom.trim().length < 2) return o.errorGroom;
    if (bride.trim().length < 2) return o.errorBride;
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) return o.errorPhone;
    return "";
  };

  const nextFromDetails = () => {
    const err = validateDetails();
    if (err) return setFieldError(err);
    goTo(3);
  };

  const submit = async () => {
    if (!packId) return setFieldError(o.errorPack);
    setFieldError("");
    setState("sending");
    try {
      const res = await fetch("/api/site/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groomName: groom.trim(),
          brideName: bride.trim(),
          weddingDate: date,
          venue: venue.trim(),
          phone: phone.trim(),
          templateId,
          packId,
          lang,
        }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  // رسالة واتساب للمتابعة بعد نجاح الطلب (إن كان الرقم مضبوطًا)
  const waSummary = [
    lang === "ar"
      ? "السلام عليكم، أرسلت طلبًا من الموقع 🌹"
      : "Bonjour, j'ai envoyé une demande depuis le site 🌹",
    `${o.groom}: ${groom.trim()}`,
    `${o.bride}: ${bride.trim()}`,
    date ? `${o.date}: ${date}` : null,
    venue.trim() ? `${o.venue}: ${venue.trim()}` : null,
    `${o.phone}: ${phone.trim()}`,
    chosen ? `${o.templateLabel}: ${chosen.name}` : null,
    pack ? `${o.packLabel}: ${pack.name[lang]} (${formatDZD(pack.price, lang)})` : null,
  ]
    .filter(Boolean)
    .join("\n");
  const waNumber = useSiteWhatsApp();
  const wa = whatsappLink(waSummary, waNumber);

  const inputCls = `w-full rounded-2xl border border-gold/30 bg-cream px-5 py-3.5 text-base text-ink shadow-sm outline-none transition-colors placeholder:text-ink/30 focus:border-gold ${font}`;
  const labelCls = `mb-2 block text-sm font-semibold text-ink/75 ${font}`;

  const stepMotion = {
    initial: { opacity: 0, x: arabic ? -32 : 32 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: arabic ? 32 : -32 },
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  };

  return (
    <div dir={t.dir} lang={lang} className="min-h-screen bg-ivory text-ink">
      {/* شريط علوي مبسّط */}
      <header className="border-b border-gold/15 bg-ivory/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3.5">
          <a href="/site" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/50 bg-cream font-monogram text-lg text-burgundy shadow-sm">
              {SITE.brandName.charAt(0)}
            </span>
            <span className="font-serif text-base font-bold text-burgundy-dark">
              {SITE.brandName}
            </span>
          </a>
          <div className="flex items-center gap-3">
            <div className="flex overflow-hidden rounded-full border border-gold/40 bg-cream text-xs font-semibold shadow-sm">
              {["ar", "fr"].map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => switchLang(l)}
                  className={`px-3.5 py-1.5 transition-colors ${
                    lang === l
                      ? "bg-burgundy text-cream"
                      : "text-burgundy/70 hover:bg-ivory-light"
                  } ${l === "ar" ? "font-arabicText" : ""}`}
                >
                  {l === "ar" ? "عربي" : "FR"}
                </button>
              ))}
            </div>
            <a href="/site" className={`text-sm text-ink/55 hover:text-burgundy ${font}`}>
              {o.backToSite}
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
        {state === "done" ? (
          <SuccessScreen
            o={o}
            font={font}
            arabic={arabic}
            wa={wa}
            summary={{ groom, bride, date, venue, chosen, pack, lang }}
          />
        ) : (
          <>
            {/* العنوان */}
            <div className="text-center">
              <p
                className={`text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-gold-dark ${font}`}
              >
                {o.kicker}
              </p>
              <h1
                className={`mt-3 text-3xl text-burgundy-dark sm:text-4xl ${
                  arabic ? "font-arabicText font-bold" : "font-serif font-semibold"
                }`}
              >
                {o.title}
              </h1>
              <p className={`mt-2 text-sm text-ink/60 ${font}`}>{o.subtitle}</p>
            </div>

            {/* مؤشر الخطوات */}
            <div className="mx-auto mt-8 flex max-w-md items-center">
              {o.steps.map((label, i) => {
                const n = i + 1;
                const active = step === n;
                const done = step > n;
                return (
                  <div key={n} className="flex flex-1 items-center last:flex-none">
                    <button
                      type="button"
                      onClick={() => done && goTo(n)}
                      disabled={!done}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold transition-all ${
                          active
                            ? "border-burgundy bg-burgundy text-cream shadow"
                            : done
                              ? "border-emerald bg-emerald/10 text-emerald"
                              : "border-gold/40 bg-cream text-ink/40"
                        }`}
                      >
                        {done ? "✓" : n}
                      </span>
                      <span
                        className={`text-[0.68rem] font-semibold ${font} ${
                          active ? "text-burgundy" : "text-ink/45"
                        }`}
                      >
                        {label}
                      </span>
                    </button>
                    {n < o.steps.length ? (
                      <span
                        className={`mx-2 mb-5 h-px flex-1 ${
                          step > n ? "bg-emerald/50" : "bg-gold/30"
                        }`}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {/* ---------- الخطوة 1: القالب ---------- */}
              {step === 1 ? (
                <motion.section key="s1" {...stepMotion} className="mt-10">
                  <StepTitle title={o.step1Title} hint={o.step1Hint} font={font} arabic={arabic} />
                  <div className="mt-6 grid gap-5 sm:grid-cols-3">
                    {LIVE_TEMPLATES.map((tpl) => {
                      const selected = templateId === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => pickTemplate(tpl.id)}
                          className={`group overflow-hidden rounded-3xl border-2 bg-cream text-start shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-royal ${
                            selected ? "border-burgundy" : "border-gold/25"
                          }`}
                        >
                          <div className="relative aspect-[3/4] overflow-hidden bg-ivory-dark">
                            {tpl.video ? (
                              /* فيديو الافتتاح كـ GIF: تشغيل تلقائي صامت متكرر */
                              <video
                                src={tpl.video}
                                poster={tpl.preview}
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              /* لا فيديو — صورة بحركة تقريب ناعمة */
                              <motion.img
                                src={tpl.preview}
                                alt={tpl.name}
                                animate={{ scale: [1, 1.08, 1] }}
                                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                                className="h-full w-full object-cover"
                              />
                            )}
                            {selected ? (
                              <span className="absolute top-3 flex h-8 w-8 items-center justify-center rounded-full bg-burgundy text-sm text-cream shadow ltr:right-3 rtl:left-3">
                                ✓
                              </span>
                            ) : null}
                          </div>
                          <p className="px-4 py-3 text-center font-serif text-sm font-semibold text-burgundy-dark">
                            {tpl.name}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </motion.section>
              ) : null}

              {/* ---------- الخطوة 2: التفاصيل ---------- */}
              {step === 2 ? (
                <motion.section key="s2" {...stepMotion} className="mx-auto mt-10 max-w-xl">
                  <StepTitle title={o.step2Title} hint={o.step2Hint} font={font} arabic={arabic} />

                  {/* القالب المختار */}
                  {chosen ? (
                    <div className="mt-6 flex items-center gap-4 rounded-3xl border border-gold/25 bg-cream p-4 shadow-card">
                      <img
                        src={chosen.preview}
                        alt={chosen.name}
                        className="h-16 rounded-xl object-cover"
                        style={{ width: "3.25rem" }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs text-ink/45 ${font}`}>{o.templateLabel}</p>
                        <p className="font-serif text-base font-semibold text-burgundy-dark">
                          {chosen.name}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => goTo(1)}
                        className={`text-xs text-burgundy underline-offset-4 hover:underline ${font}`}
                      >
                        {o.back}
                      </button>
                    </div>
                  ) : null}

                  <div className="mt-6 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className={labelCls}>{o.groom} *</label>
                        <input
                          type="text"
                          value={groom}
                          onChange={(e) => setGroom(e.target.value)}
                          placeholder={o.groomPh}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>{o.bride} *</label>
                        <input
                          type="text"
                          value={bride}
                          onChange={(e) => setBride(e.target.value)}
                          placeholder={o.bridePh}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className={labelCls}>{o.phone} *</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder={o.phonePh}
                          autoComplete="tel"
                          inputMode="tel"
                          dir="ltr"
                          className={`${inputCls} ${arabic ? "text-right" : ""}`}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>
                          {o.date}{" "}
                          <span className="font-normal text-ink/40">({o.optional})</span>
                        </label>
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className={`${inputCls} cursor-pointer`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>
                        {o.venue}{" "}
                        <span className="font-normal text-ink/40">({o.optional})</span>
                      </label>
                      <input
                        type="text"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        placeholder={o.venuePh}
                        className={inputCls}
                      />
                    </div>

                    {fieldError ? (
                      <p
                        className={`rounded-2xl bg-burgundy/8 px-5 py-3 text-sm text-burgundy ${font}`}
                        role="alert"
                      >
                        {fieldError}
                      </p>
                    ) : null}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => goTo(1)}
                        className={`rounded-full border border-gold/40 bg-cream px-7 py-3.5 text-sm font-semibold text-burgundy-dark transition-all hover:border-gold ${font}`}
                      >
                        {o.back}
                      </button>
                      <button
                        type="button"
                        onClick={nextFromDetails}
                        className={`flex-1 rounded-full bg-burgundy px-7 py-3.5 text-base font-bold text-cream shadow-[0_12px_30px_-10px_rgb(var(--color-burgundy)/0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-burgundy-dark ${font}`}
                      >
                        {o.next}
                      </button>
                    </div>
                  </div>
                </motion.section>
              ) : null}

              {/* ---------- الخطوة 3: الباقة ---------- */}
              {step === 3 ? (
                <motion.section key="s3" {...stepMotion} className="mt-10">
                  <StepTitle title={o.step3Title} hint={o.step3Hint} font={font} arabic={arabic} />

                  <div className="mt-6 grid gap-5 lg:grid-cols-3">
                    {PRICING.map((p) => {
                      const selected = packId === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setPackId(p.id);
                            setFieldError("");
                          }}
                          className={`relative flex h-full flex-col rounded-3xl border-2 bg-cream p-6 text-start shadow-card transition-all duration-300 hover:-translate-y-1 ${
                            selected
                              ? "border-burgundy shadow-royal"
                              : p.highlight
                                ? "border-gold/60"
                                : "border-gold/25"
                          }`}
                        >
                          {p.highlight ? (
                            <span
                              className={`absolute -top-3 start-6 rounded-full bg-gold px-3 py-1 text-[0.65rem] font-bold text-burgundy-dark shadow ${font}`}
                            >
                              ⭐ {t.pricing.popular}
                            </span>
                          ) : null}
                          <span
                            className={`absolute top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs ltr:right-4 rtl:left-4 ${
                              selected
                                ? "border-burgundy bg-burgundy text-cream"
                                : "border-gold/40 text-transparent"
                            }`}
                          >
                            ✓
                          </span>

                          <h3
                            className={`text-base font-semibold text-burgundy-dark ${
                              arabic ? "font-arabicText" : "font-serif"
                            }`}
                          >
                            {p.name[lang]}
                          </h3>
                          <div className="mt-2 flex items-baseline gap-2">
                            {p.oldPrice ? (
                              <span className="text-xs text-ink/35 line-through tabular-nums">
                                {formatDZD(p.oldPrice, lang)}
                              </span>
                            ) : null}
                            <span className="font-serif text-2xl font-bold text-burgundy-dark tabular-nums">
                              {formatDZD(p.price, lang)}
                            </span>
                          </div>
                          <ul className="mt-4 flex-1 space-y-2">
                            {p.features[lang].slice(0, 4).map((f, j) => (
                              <li
                                key={j}
                                className={`flex items-start gap-2 text-xs leading-relaxed text-ink/65 ${font}`}
                              >
                                <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </button>
                      );
                    })}
                  </div>

                  {fieldError || state === "error" ? (
                    <p
                      className={`mt-5 rounded-2xl bg-burgundy/8 px-5 py-3 text-sm text-burgundy ${font}`}
                      role="alert"
                    >
                      {fieldError || o.errorGeneric}
                      {state === "error" && (
                        <>
                          {" "}
                          <a
                            href={`mailto:${SITE.email}`}
                            className="underline underline-offset-4"
                          >
                            {SITE.email}
                          </a>
                        </>
                      )}
                    </p>
                  ) : null}

                  <div className="mx-auto mt-7 flex max-w-xl gap-3">
                    <button
                      type="button"
                      onClick={() => goTo(2)}
                      className={`rounded-full border border-gold/40 bg-cream px-7 py-3.5 text-sm font-semibold text-burgundy-dark transition-all hover:border-gold ${font}`}
                    >
                      {o.back}
                    </button>
                    <button
                      type="button"
                      onClick={submit}
                      disabled={state === "sending"}
                      className={`flex-1 rounded-full bg-burgundy px-7 py-3.5 text-base font-bold text-cream shadow-[0_12px_30px_-10px_rgb(var(--color-burgundy)/0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-burgundy-dark disabled:cursor-not-allowed disabled:opacity-60 ${font}`}
                    >
                      {state === "sending" ? o.sending : o.submit}
                    </button>
                  </div>
                </motion.section>
              ) : null}
            </AnimatePresence>
          </>
        )}
      </main>
    </div>
  );
}

function StepTitle({ title, hint, font, arabic }) {
  return (
    <div className="text-center">
      <h2
        className={`text-xl font-semibold text-burgundy-dark sm:text-2xl ${
          arabic ? "font-arabicText" : "font-serif"
        }`}
      >
        {title}
      </h2>
      <p className={`mt-1 text-sm text-ink/50 ${font}`}>{hint}</p>
    </div>
  );
}

function SuccessScreen({ o, font, arabic, wa, summary }) {
  const { groom, bride, date, venue, chosen, pack, lang } = summary;
  const rows = [
    [o.groom, groom],
    [o.bride, bride],
    date ? [o.date, date] : null,
    venue.trim() ? [o.venue, venue] : null,
    chosen ? [o.templateLabel, chosen.name] : null,
    pack ? [o.packLabel, `${pack.name[lang]} — ${formatDZD(pack.price, lang)}`] : null,
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-xl rounded-3xl border border-gold/25 bg-cream p-8 text-center shadow-royal sm:p-10"
    >
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald/10 text-3xl">
        ✓
      </span>
      <h1
        className={`mt-5 text-2xl font-bold text-burgundy-dark ${
          arabic ? "font-arabicText" : "font-serif"
        }`}
      >
        {o.successTitle}
      </h1>
      <p className={`mt-3 text-sm leading-relaxed text-ink/65 ${font}`}>
        {o.successText}
      </p>

      {/* ملخص الطلب */}
      <dl className="mt-6 space-y-2 rounded-2xl bg-ivory-light/70 p-5 text-start">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-4">
            <dt className={`text-xs text-ink/45 ${font}`}>{k}</dt>
            <dd className={`text-sm font-semibold text-ink/80 ${font}`}>{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-7 flex flex-col items-center gap-3">
        {wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 rounded-full bg-burgundy px-7 py-3 text-sm font-semibold text-cream transition-all hover:bg-burgundy-dark ${font}`}
          >
            <WhatsAppIcon />
            {o.continueWhatsApp}
          </a>
        ) : null}
        <a
          href="/site"
          className={`text-sm text-ink/55 underline-offset-4 hover:text-burgundy hover:underline ${font}`}
        >
          {o.backToSite}
        </a>
      </div>
    </motion.div>
  );
}
