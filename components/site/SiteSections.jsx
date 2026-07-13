"use client";

/**
 * أقسام العرض: معرض القوالب، كيف يعمل، مقارنة ورقي/رقمي،
 * لوحة المتابعة، وتعدد اللغات.
 */

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

      <div className="mx-auto mt-14 grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
        {live.map((tpl, i) => {
          return (
            <Reveal key={tpl.id} delay={i * 0.08}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-gold/25 bg-cream shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:shadow-royal">
                {/* رقم القالب */}
                <span
                  className="absolute top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-ivory/90 font-serif text-sm font-semibold text-burgundy shadow-sm backdrop-blur ltr:left-4 rtl:right-4"
                  aria-hidden
                >
                  {i + 1}
                </span>
                {tpl.badge ? (
                  <span
                    className={`absolute top-4 z-10 rounded-full bg-burgundy px-3.5 py-1.5 text-[0.68rem] font-semibold tracking-wide text-cream shadow ltr:right-4 rtl:left-4 ${
                      arabic ? "font-arabicText" : ""
                    }`}
                  >
                    {tpl.badge[lang]}
                  </span>
                ) : null}

                <div className="relative aspect-[4/5] overflow-hidden bg-ivory-dark">
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
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </div>

                <div className="flex flex-1 flex-col gap-3 p-6">
                  <h3 className="font-serif text-xl font-semibold text-burgundy-dark">
                    {tpl.name}
                  </h3>
                  <p
                    className={`flex-1 text-sm leading-relaxed text-ink/65 ${
                      arabic ? "font-arabicText" : "font-body"
                    }`}
                  >
                    {tpl.description[lang]}
                  </p>
                  <div className="mt-2 flex flex-col gap-2.5">
                    <GhostButton href={tpl.demoUrl} newTab className="w-full !py-2.5">
                      <span className={arabic ? "font-arabicText" : ""}>
                        {t.templates.viewDemo}
                      </span>
                      <span aria-hidden>{arabic ? "←" : "→"}</span>
                    </GhostButton>
                    <PrimaryButton
                      href={`/site/order?template=${tpl.id}`}
                      className="w-full !py-2.5"
                    >
                      <span className={arabic ? "font-arabicText" : ""}>
                        {t.order.orderNow}
                      </span>
                      <span aria-hidden>{arabic ? "←" : "→"}</span>
                    </PrimaryButton>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}

        {/* بطاقة "قريبًا" */}
        <Reveal delay={live.length * 0.08}>
          <article className="flex h-full min-h-[420px] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-gold/40 bg-ivory-light/60 p-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-2xl">
              ✨
            </span>
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
            <div className="mt-1 flex flex-wrap justify-center gap-2">
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
      </div>
    </section>
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
