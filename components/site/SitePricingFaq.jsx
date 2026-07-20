"use client";

/**
 * الأسعار، التقييمات، الأسئلة الشائعة، والتواصل.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FAQ,
  PRICING,
  SITE,
  TESTIMONIALS,
  formatDZD,
  whatsappLink,
} from "./site-config";
import {
  CheckIcon,
  PrimaryButton,
  Reveal,
  SectionHead,
  WhatsAppIcon,
} from "./ui";
import { useSiteWhatsApp } from "./useSiteWhatsApp";

const sectionPad = "px-5 py-20 sm:px-8 sm:py-24";

/* ------------------------------------------------------------------ */
/* الأسعار                                                             */
/* ------------------------------------------------------------------ */

export function PricingSection({ lang, t }) {
  const arabic = lang === "ar";
  const font = arabic ? "font-arabicText" : "font-body";

  return (
    <section id="pricing" className={`${sectionPad} bg-ivory-light/60`}>
      <SectionHead
        lang={lang}
        kicker={t.pricing.kicker}
        title={t.pricing.title}
        subtitle={t.pricing.subtitle}
      />

      <div className="mx-auto mt-14 grid max-w-5xl items-stretch gap-7 lg:grid-cols-3">
        {PRICING.map((pack, i) => {
          return (
            <Reveal key={pack.id} delay={i * 0.1} className="h-full">
              <div
                className={`relative flex h-full flex-col rounded-3xl p-7 ${
                  pack.highlight
                    ? "border-2 border-gold/70 bg-gradient-to-b from-burgundy to-burgundy-dark text-cream shadow-royal lg:-translate-y-3"
                    : "border border-gold/25 bg-cream text-ink shadow-card"
                }`}
              >
                {pack.highlight ? (
                  <span
                    className={`absolute -top-3.5 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 whitespace-nowrap rounded-full bg-gold px-4 py-1.5 text-[0.7rem] font-bold text-burgundy-dark shadow ${font}`}
                  >
                    ⭐ {t.pricing.popular}
                  </span>
                ) : null}

                <h3
                  className={`text-lg font-semibold ${
                    pack.highlight ? "text-gold-light" : "text-burgundy-dark"
                  } ${arabic ? "font-arabicText" : "font-serif"}`}
                >
                  {pack.name[lang]}
                </h3>

                <div className="mt-3 flex items-baseline gap-2.5">
                  {pack.oldPrice ? (
                    <span
                      className={`text-sm line-through tabular-nums ${
                        pack.highlight ? "text-cream/50" : "text-ink/35"
                      }`}
                    >
                      {formatDZD(pack.oldPrice, lang)}
                    </span>
                  ) : null}
                  <span
                    className={`font-serif text-3xl font-bold tabular-nums ${
                      pack.highlight ? "text-gold-light" : "text-burgundy-dark"
                    }`}
                  >
                    {formatDZD(pack.price, lang)}
                  </span>
                </div>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {pack.features[lang].map((f, j) => (
                    <li
                      key={j}
                      className={`flex items-start gap-2.5 text-sm leading-relaxed ${font} ${
                        pack.highlight ? "text-cream/90" : "text-ink/70"
                      }`}
                    >
                      <CheckIcon
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          pack.highlight ? "text-gold-light" : "text-emerald"
                        }`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href={`/site/order?pack=${pack.id}`}
                  className={`mt-7 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 ${font} ${
                    pack.highlight
                      ? "bg-gold text-burgundy-dark shadow hover:bg-gold-light"
                      : "border border-burgundy/30 text-burgundy hover:border-burgundy hover:bg-burgundy hover:text-cream"
                  }`}
                >
                  {t.pricing.choose}
                  <span aria-hidden>{arabic ? "←" : "→"}</span>
                </a>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* ضمان الاسترجاع — كاسر حاجز الثقة الأول في السوق الجزائري */}
      <Reveal delay={0.1}>
        <div className="mx-auto mt-10 flex max-w-2xl items-center gap-4 rounded-2xl border border-gold/40 bg-gold/[0.07] px-6 py-5">
          <span
            aria-hidden
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold-dark"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2 4 5.5v5c0 5 3.4 9.3 8 11.5 4.6-2.2 8-6.5 8-11.5v-5L12 2Z" />
              <path d="m8.5 12 2.3 2.3L15.5 9.6" />
            </svg>
          </span>
          <div className="text-start">
            <p className={`text-base font-semibold text-burgundy ${arabic ? "font-arabicText" : "font-serif"}`}>
              {t.pricing.guaranteeTitle}
            </p>
            <p className={`mt-1 text-sm leading-relaxed text-ink/70 ${arabic ? "font-arabicText" : "font-body"}`}>
              {t.pricing.guaranteeText}
            </p>
          </div>
        </div>
      </Reveal>

      <p
        className={`mt-6 text-center text-xs text-ink/45 ${
          arabic ? "font-arabicText" : "font-body"
        }`}
      >
        {t.pricing.currencyNote}
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* التقييمات                                                           */
/* ------------------------------------------------------------------ */

export function TestimonialsSection({ lang, t }) {
  const arabic = lang === "ar";
  const font = arabic ? "font-arabicText" : "font-body";

  return (
    <section className={sectionPad}>
      <SectionHead
        lang={lang}
        kicker={t.testimonials.kicker}
        title={t.testimonials.title}
      />
      <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((tm, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <figure className="flex h-full flex-col rounded-3xl border border-gold/20 bg-cream p-6 shadow-card">
              <div className="text-gold" aria-hidden>
                {"★★★★★"}
              </div>
              <blockquote
                className={`mt-3 flex-1 text-sm leading-relaxed text-ink/70 ${font}`}
              >
                “{tm.text[lang]}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-burgundy/10 font-serif text-xs font-bold text-burgundy">
                  {tm.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink/85">{tm.name}</p>
                  <p className={`text-xs text-ink/45 ${font}`}>
                    📍 {tm.city[lang]}
                  </p>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* الأسئلة الشائعة                                                     */
/* ------------------------------------------------------------------ */

export function FaqSection({ lang, t }) {
  const arabic = lang === "ar";
  const font = arabic ? "font-arabicText" : "font-body";
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className={`${sectionPad} bg-ivory-light/60`}>
      <SectionHead lang={lang} kicker={t.faq.kicker} title={t.faq.title} />
      <div className="mx-auto mt-12 max-w-2xl space-y-3">
        {FAQ.map((item, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={i} delay={i * 0.05}>
              <div className="overflow-hidden rounded-2xl border border-gold/25 bg-cream shadow-card">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className={`flex w-full items-center justify-between gap-4 px-6 py-4 text-start text-sm font-semibold text-burgundy-dark sm:text-base ${font}`}
                  aria-expanded={isOpen}
                >
                  {item.q[lang]}
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="shrink-0 text-lg text-gold-dark"
                    aria-hidden
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="a"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p
                        className={`border-t border-gold/15 px-6 py-4 text-sm leading-relaxed text-ink/65 ${font}`}
                      >
                        {item.a[lang]}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* التواصل                                                             */
/* ------------------------------------------------------------------ */

export function ContactSection({ lang, t }) {
  const arabic = lang === "ar";
  const font = arabic ? "font-arabicText" : "font-body";
  const waNumber = useSiteWhatsApp();
  const wa = whatsappLink(t.contact.defaultMessage, waNumber);

  return (
    <section id="contact" className={sectionPad}>
      <Reveal className="mx-auto max-w-3xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-burgundy via-burgundy to-burgundy-dark px-7 py-14 text-center text-cream shadow-royal sm:px-12">
          {/* توهج ذهبي خفيف */}
          <div
            className="pointer-events-none absolute -top-24 start-1/2 h-64 w-64 -translate-x-1/2 rtl:translate-x-1/2 rounded-full bg-gold/20 blur-3xl"
            aria-hidden
          />
          <p
            className={`text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-gold-light ${font}`}
          >
            {t.contact.kicker}
          </p>
          <h2
            className={`mt-3 text-3xl font-bold sm:text-4xl ${
              arabic ? "font-arabicText" : "font-serif"
            }`}
          >
            {t.contact.title}
          </h2>
          <p className={`mx-auto mt-4 max-w-md text-sm text-cream/75 sm:text-base ${font}`}>
            {t.contact.subtitle}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2.5 rounded-full bg-gold px-8 py-3.5 text-sm font-bold text-burgundy-dark shadow transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-light ${font}`}
              >
                <WhatsAppIcon className="h-5 w-5" />
                {t.contact.whatsapp}
              </a>
            ) : (
              <p className={`text-sm text-gold-light ${font}`}>
                {t.contact.whatsappMissing}
              </p>
            )}
            <a
              href={`mailto:${SITE.email}`}
              className={`inline-flex items-center gap-2 rounded-full border border-cream/30 px-8 py-3.5 text-sm font-semibold text-cream transition-all duration-300 hover:-translate-y-0.5 hover:border-cream/60 ${font}`}
            >
              ✉️ {SITE.email}
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
