"use client";

/**
 * أقسام العرض: معرض القوالب، كيف يعمل، مقارنة ورقي/رقمي،
 * لوحة المتابعة، وتعدد اللغات.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { CATALOG, COMPARISON, formatDZD } from "./site-config";
import {
  CheckIcon,
  GhostButton,
  PrimaryButton,
  Reveal,
  SectionHead,
} from "./ui";

const sectionPad = "px-5 py-20 sm:px-8 sm:py-24";

/* ------------------------------------------------------------------ */
/* معرض القوالب                                                        */
/* ------------------------------------------------------------------ */

export function TemplatesSection({ lang, t }) {
  const arabic = lang === "ar";
  const live = CATALOG.filter((c) => !c.comingSoon);
  const soon = CATALOG.filter((c) => c.comingSoon);

  return (
    <section id="templates" className={sectionPad}>
      <SectionHead
        lang={lang}
        kicker={t.templates.kicker}
        title={t.templates.title}
        subtitle={t.templates.subtitle}
      />

      {/* كل قالب في قسم عريض لوحده — معاينة في جهة وتفاصيل في الأخرى بالتناوب */}
      <div className="mx-auto mt-16 max-w-6xl space-y-16 sm:space-y-24">
        {live.map((tpl, i) => (
          <TemplateCard key={tpl.id} tpl={tpl} i={i} lang={lang} t={t} />
        ))}
      </div>

      {/* شريط "قريبًا" */}
      <Reveal delay={0.1} className="mx-auto mt-16 max-w-6xl">
        <article className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-gold/40 bg-ivory-light/60 p-8 text-center sm:flex-row sm:justify-between sm:text-start">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold/10 text-2xl">
              ✨
            </span>
            <div>
              <h3
                className={`text-lg font-semibold text-burgundy-dark ${
                  arabic ? "font-arabicText" : "font-serif"
                }`}
              >
                {t.templates.soon}
              </h3>
              <p
                className={`text-sm text-ink/55 ${
                  arabic ? "font-arabicText" : "font-body"
                }`}
              >
                {t.templates.soonNote}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {soon.map((s) => (
              <span
                key={s.id}
                className="rounded-full border border-gold/30 bg-cream px-3.5 py-1.5 font-serif text-xs text-burgundy/80"
              >
                {s.name}
              </span>
            ))}
          </div>
        </article>
      </Reveal>
    </section>
  );
}

/* قسم عرض كامل لكل قالب — المعاينة في جهة والتفاصيل في الأخرى بالتناوب،
   مع تبويبين: «شاشة الافتتاح» (الظرف) و«الدعوة من الداخل»
   (فيديو القالب الحقيقي يعمل تلقائيًا، أو صورة الداخل) */
function TemplateCard({ tpl, i, lang, t }) {
  const arabic = lang === "ar";
  const [view, setView] = useState("opening"); // opening | inside
  const hasInside = Boolean(tpl.inside);
  const showInside = hasInside && view === "inside";
  const flip = i % 2 === 1; // تناوب جهة المعاينة

  const tabs = [
    { key: "opening", label: t.templates.tabOpening },
    { key: "inside", label: t.templates.tabInside },
  ];

  return (
    <Reveal delay={0.05}>
      <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
        {/* المعاينة */}
        <div className={flip ? "lg:order-2" : ""}>
          <div className="group relative mx-auto max-w-md overflow-hidden rounded-3xl border border-gold/25 bg-cream shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:shadow-royal lg:max-w-none">
            {hasInside ? (
              <div className="flex border-b border-gold/15 bg-ivory-light/70 text-xs font-semibold">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setView(tab.key)}
                    className={`flex-1 px-2 py-2.5 transition-colors ${
                      view === tab.key
                        ? "bg-burgundy text-cream"
                        : "text-ink/55 hover:text-burgundy"
                    } ${arabic ? "font-arabicText" : ""}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="relative aspect-[4/5] overflow-hidden bg-ivory-dark">
              {tpl.badge ? (
                <span
                  className={`absolute top-4 z-10 rounded-full bg-burgundy px-3.5 py-1.5 text-[0.68rem] font-semibold tracking-wide text-cream shadow ltr:right-4 rtl:left-4 ${
                    arabic ? "font-arabicText" : ""
                  }`}
                >
                  {tpl.badge[lang]}
                </span>
              ) : null}

              {showInside ? (
                tpl.inside.type === "video" ? (
                  <video
                    src={tpl.inside.src}
                    poster={tpl.inside.poster}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={tpl.inside.src}
                    alt={tpl.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                )
              ) : (
                <>
                  <img
                    src={tpl.preview}
                    alt={tpl.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                  {tpl.seal ? (
                    <img
                      src={tpl.seal.src}
                      alt=""
                      loading="lazy"
                      draggable={false}
                      aria-hidden
                      className="pointer-events-none absolute left-1/2 select-none transition-transform duration-700 group-hover:scale-[1.05]"
                      style={{
                        top: tpl.seal.top,
                        width: tpl.seal.width,
                        transform: "translate(-50%, -50%)",
                        filter: "drop-shadow(0 6px 14px rgb(30 8 13 / 0.35))",
                      }}
                    />
                  ) : null}
                </>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </div>
          </div>
        </div>

        {/* التفاصيل */}
        <div className={`text-center lg:text-start ${flip ? "lg:order-1" : ""}`}>
          <span
            className="font-serif text-6xl font-semibold leading-none text-gold/30 sm:text-7xl"
            aria-hidden
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-3 font-serif text-3xl font-bold text-burgundy-dark sm:text-4xl">
            {tpl.name}
          </h3>
          <div
            className="mx-auto mt-4 h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent lg:mx-0"
            aria-hidden
          />
          <p
            className={`mx-auto mt-5 max-w-md text-base leading-relaxed text-ink/65 lg:mx-0 ${
              arabic ? "font-arabicText" : "font-body"
            }`}
          >
            {tpl.description[lang]}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <PrimaryButton
              href={`/site/order?template=${tpl.id}`}
              className="w-full sm:w-auto !px-7 !py-3"
            >
              <span className={arabic ? "font-arabicText" : ""}>
                {t.order.orderNow}
              </span>
              <span aria-hidden>{arabic ? "←" : "→"}</span>
            </PrimaryButton>
            <GhostButton
              href={tpl.demoUrl}
              newTab
              className="w-full sm:w-auto !px-7 !py-3"
            >
              <span className={arabic ? "font-arabicText" : ""}>
                {t.templates.viewDemo}
              </span>
              <span aria-hidden>{arabic ? "←" : "→"}</span>
            </GhostButton>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* كيف يعمل                                                            */
/* ------------------------------------------------------------------ */

const STEP_ICONS = ["🎨", "💬", "🖋️", "🔗"];

export function HowSection({ lang, t }) {
  const arabic = lang === "ar";
  return (
    <section id="how" className={`${sectionPad} bg-ivory-light/60`}>
      <SectionHead lang={lang} kicker={t.how.kicker} title={t.how.title} />
      <div className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {t.how.steps.map((step, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <div className="relative h-full rounded-3xl border border-gold/20 bg-cream p-6 pt-8 text-center shadow-card">
              <span className="absolute -top-4 start-1/2 flex h-9 w-9 -translate-x-1/2 rtl:translate-x-1/2 items-center justify-center rounded-full bg-burgundy font-serif text-sm font-semibold text-cream shadow">
                {i + 1}
              </span>
              <div className="text-3xl" aria-hidden>
                {STEP_ICONS[i]}
              </div>
              <h3
                className={`mt-3 text-lg font-semibold text-burgundy-dark ${
                  arabic ? "font-arabicText" : "font-serif"
                }`}
              >
                {step.title}
              </h3>
              <p
                className={`mt-2 text-sm leading-relaxed text-ink/60 ${
                  arabic ? "font-arabicText" : "font-body"
                }`}
              >
                {step.text}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* مقارنة ورقي / رقمي                                                  */
/* ------------------------------------------------------------------ */

export function CompareSection({ lang, t }) {
  const arabic = lang === "ar";
  const paperTotal = COMPARISON.paper.reduce((s, r) => s + r.price, 0);
  const saved = paperTotal - COMPARISON.digitalFrom;
  const font = arabic ? "font-arabicText" : "font-body";

  return (
    <section className={sectionPad}>
      <SectionHead
        lang={lang}
        kicker={t.compare.kicker}
        title={t.compare.title}
        subtitle={t.compare.subtitle}
      />

      <div className="mx-auto mt-14 grid max-w-4xl gap-8 md:grid-cols-2">
        {/* فاتورة الورقي */}
        <Reveal>
          <div className="h-full rounded-3xl border border-ink/10 bg-cream p-7 shadow-card">
            <h3 className={`text-lg font-semibold text-ink/70 ${font}`}>
              {t.compare.paperTitle}
            </h3>
            <ul className="mt-5 space-y-3">
              {COMPARISON.paper.map((row, i) => (
                <li
                  key={i}
                  className={`flex items-baseline justify-between gap-3 text-sm text-ink/65 ${font}`}
                >
                  <span>{row.label[lang]}</span>
                  <span className="flex-1 border-b border-dotted border-ink/20" />
                  <span className="font-semibold tabular-nums">
                    {formatDZD(row.price, lang)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 border-t border-ink/15 pt-4">
              <div
                className={`flex items-center justify-between text-base font-bold text-ink ${font}`}
              >
                <span>{t.compare.paperTotal}</span>
                <span className="tabular-nums">{formatDZD(paperTotal, lang)}</span>
              </div>
              <p className={`mt-2 text-xs text-ink/45 ${font}`}>
                {t.compare.paperNote}
              </p>
            </div>
          </div>
        </Reveal>

        {/* بطاقة الرقمي */}
        <Reveal delay={0.12}>
          <div className="relative h-full overflow-hidden rounded-3xl border border-gold/40 bg-gradient-to-b from-burgundy to-burgundy-dark p-7 text-cream shadow-royal">
            <span
              className={`absolute top-5 rounded-full bg-gold px-3.5 py-1.5 text-[0.7rem] font-bold text-burgundy-dark shadow ltr:right-5 rtl:left-5 ${font}`}
            >
              {t.compare.save} {formatDZD(saved, lang)}
            </span>
            <h3 className={`text-lg font-semibold text-gold-light ${font}`}>
              {t.compare.digitalTitle}
            </h3>
            <ul className="mt-5 space-y-2.5">
              {t.compare.digitalPerks.map((perk, i) => (
                <li
                  key={i}
                  className={`flex items-center gap-2.5 text-sm text-cream/90 ${font}`}
                >
                  <CheckIcon className="h-4 w-4 shrink-0 text-gold-light" />
                  {perk}
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-cream/15 pt-4">
              <p className={`text-xs uppercase tracking-widest text-cream/60 ${font}`}>
                {t.compare.digitalFrom}
              </p>
              <p className="mt-1 font-serif text-3xl font-bold text-gold-light tabular-nums">
                {formatDZD(COMPARISON.digitalFrom, lang)}
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* جدول المزايا */}
      <Reveal className="mx-auto mt-10 max-w-4xl">
        <div className="overflow-hidden rounded-3xl border border-gold/25 bg-cream shadow-card">
          <div
            className={`grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-gold/15 bg-ivory-light/70 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-ink/50 ${font}`}
          >
            <span>{t.compare.tableFeature}</span>
            <span className="w-16 text-center">{t.compare.tablePaper}</span>
            <span className="w-16 text-center">{t.compare.tableDigital}</span>
          </div>
          {t.compare.tableRows.map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-[1fr_auto_auto] items-center gap-4 px-6 py-3 text-sm text-ink/75 ${font} ${
                i % 2 ? "bg-ivory-light/40" : ""
              }`}
            >
              <span>{row}</span>
              <span className="w-16 text-center text-ink/30">✕</span>
              <span className="w-16 text-center text-emerald">
                <CheckIcon className="mx-auto h-5 w-5" />
              </span>
            </div>
          ))}
        </div>
        <p className={`mt-4 text-center text-xs text-ink/45 ${font}`}>
          🌿 {t.compare.eco}
        </p>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* لوحة المتابعة (محاكاة)                                              */
/* ------------------------------------------------------------------ */

const MOCK_GUESTS = [
  { initial: "S", name: "Sara & Walid", count: 2, status: "ok" },
  { initial: "ع", name: "عائلة بن يوسف", count: 4, status: "ok" },
  { initial: "N", name: "Nadia B.", count: 1, status: "no" },
  { initial: "م", name: "مراد و لينة", count: 2, status: "ok" },
];

export function DashboardSection({ lang, t }) {
  const arabic = lang === "ar";
  const font = arabic ? "font-arabicText" : "font-body";

  return (
    <section id="features" className={`${sectionPad} bg-ivory-light/60`}>
      <SectionHead
        lang={lang}
        kicker={t.dashboard.kicker}
        title={t.dashboard.title}
        subtitle={t.dashboard.subtitle}
      />

      <div className="mx-auto mt-14 grid max-w-5xl items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        {/* محاكاة اللوحة */}
        <Reveal>
          <div className="rounded-3xl border border-gold/25 bg-cream p-5 shadow-royal sm:p-7">
            <div className="grid grid-cols-3 gap-3">
              {[
                { n: 86, label: t.dashboard.confirmed, cls: "text-emerald" },
                { n: 24, label: t.dashboard.pending, cls: "text-gold-dark" },
                { n: 8, label: t.dashboard.declined, cls: "text-burgundy" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-ivory-light/80 px-3 py-4 text-center"
                >
                  <p className={`font-serif text-3xl font-bold tabular-nums ${s.cls}`}>
                    {s.n}
                  </p>
                  <p className={`mt-1 text-[0.7rem] text-ink/55 ${font}`}>{s.label}</p>
                </div>
              ))}
            </div>
            <p
              className={`mt-6 mb-3 text-xs font-semibold uppercase tracking-wider text-ink/45 ${font}`}
            >
              {t.dashboard.guestList}
            </p>
            <ul className="space-y-2">
              {MOCK_GUESTS.map((g, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-2xl border border-gold/15 bg-ivory-light/50 px-4 py-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-burgundy/10 font-serif text-sm font-semibold text-burgundy">
                    {g.initial}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink/85">
                      {g.name}
                    </p>
                    <p className={`text-xs text-ink/45 ${font}`}>
                      {g.count} {t.dashboard.guests}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[0.68rem] font-semibold ${font} ${
                      g.status === "ok"
                        ? "bg-emerald/10 text-emerald"
                        : "bg-burgundy/10 text-burgundy"
                    }`}
                  >
                    {g.status === "ok" ? t.dashboard.confirmed : t.dashboard.declined}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* المزايا */}
        <div className="space-y-5">
          {t.dashboard.features.map((f, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="flex gap-4 rounded-3xl border border-gold/20 bg-cream p-5 shadow-card">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold/12 text-xl">
                  {["📋", "👨‍👩‍👧", "📥"][i]}
                </span>
                <div>
                  <h3
                    className={`text-base font-semibold text-burgundy-dark ${
                      arabic ? "font-arabicText" : "font-serif"
                    }`}
                  >
                    {f.title}
                  </h3>
                  <p className={`mt-1 text-sm leading-relaxed text-ink/60 ${font}`}>
                    {f.text}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* تعدد اللغات                                                         */
/* ------------------------------------------------------------------ */

export function LangsSection({ lang, t }) {
  const arabic = lang === "ar";
  const font = arabic ? "font-arabicText" : "font-body";

  return (
    <section className={sectionPad}>
      <SectionHead
        lang={lang}
        kicker={t.langs.kicker}
        title={t.langs.title}
        subtitle={t.langs.subtitle}
      />
      <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
        {t.langs.cards.map((c, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <div className="h-full rounded-3xl border border-gold/20 bg-cream p-6 text-center shadow-card">
              <div className="text-2xl" aria-hidden>
                {["🌍", "🔁", "↔️"][i]}
              </div>
              <h3
                className={`mt-3 text-base font-semibold text-burgundy-dark ${
                  arabic ? "font-arabicText" : "font-serif"
                }`}
              >
                {c.title}
              </h3>
              <p className={`mt-1.5 text-sm text-ink/60 ${font}`}>{c.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-4">
        <motion.div
          className="flex items-center gap-4 rounded-full border border-gold/30 bg-cream px-8 py-3 shadow-card"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="font-arabicText text-lg font-bold text-burgundy-dark">
            العربية
          </span>
          <span className="text-gold" aria-hidden>
            ⇄
          </span>
          <span className="font-serif text-lg font-semibold text-burgundy-dark">
            Français
          </span>
        </motion.div>
      </Reveal>
    </section>
  );
}
