"use client";

/**
 * الموقع التسويقي — الصفحة الكاملة.
 * منفصل تمامًا عن مكوّنات الدعوات: يعيش في /site ولا يلمس أي مسار آخر.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PRICING, REVIEWS_STRIP, SITE, TESTIMONIALS, formatDZD } from "./site-config";
import { COPY } from "./site-copy";
import {
  CompareSection,
  DashboardSection,
  HowSection,
  LangsSection,
  TemplatesSection,
} from "./SiteSections";
import {
  ContactSection,
  FaqSection,
  PricingSection,
  TestimonialsSection,
} from "./SitePricingFaq";
import { Flourish, GhostButton, PrimaryButton } from "./ui";
import ShowcaseWall from "./ShowcaseWall";

const LANG_KEY = "dawati-site-lang";

export default function SiteHome() {
  const [lang, setLang] = useState("ar");
  const t = COPY[lang];
  const arabic = lang === "ar";

  useEffect(() => {
    const saved = window.localStorage.getItem(LANG_KEY);
    if (saved === "fr" || saved === "ar") setLang(saved);
  }, []);

  const switchLang = (next) => {
    setLang(next);
    window.localStorage.setItem(LANG_KEY, next);
  };

  return (
    <div
      dir={t.dir}
      lang={lang}
      className="min-h-screen bg-ivory text-ink [text-rendering:optimizeLegibility]"
    >
      <NavBar lang={lang} t={t} onSwitch={switchLang} />
      <Hero lang={lang} t={t} />
      <ReviewsTicker lang={lang} t={t} />
      {/* الباقات مقدَّمة إلى أعلى الصفحة — يرى الزائر السعر قبل التفاصيل */}
      <PricingSection lang={lang} t={t} />
      <TemplatesSection lang={lang} t={t} />
      <HowSection lang={lang} t={t} />
      <CompareSection lang={lang} t={t} />
      <DashboardSection lang={lang} t={t} />
      <LangsSection lang={lang} t={t} />
      <TestimonialsSection lang={lang} t={t} />
      <FaqSection lang={lang} t={t} />
      <ContactSection lang={lang} t={t} />
      <Footer lang={lang} t={t} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* شريط التنقل                                                         */
/* ------------------------------------------------------------------ */

function NavBar({ lang, t, onSwitch }) {
  const arabic = lang === "ar";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#templates", label: t.nav.templates },
    { href: "#how", label: t.nav.how },
    { href: "#features", label: t.nav.features },
    { href: "#pricing", label: t.nav.pricing },
    { href: "#faq", label: t.nav.faq },
    { href: "#contact", label: t.nav.contact },
  ];
  const font = arabic ? "font-arabicText" : "font-body";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-gold/20 bg-ivory/90 shadow-sm backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        {/* الشعار */}
        <a href="#" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/50 bg-cream font-monogram text-lg text-burgundy shadow-sm">
            {SITE.brandName.charAt(0)}
          </span>
          <span className="leading-tight">
            <span className="block font-serif text-base font-bold tracking-wide text-burgundy-dark">
              {SITE.brandName}
            </span>
            <span className="block font-arabicText text-[0.7rem] text-gold-dark">
              {SITE.brandNameAr}
            </span>
          </span>
        </a>

        {/* روابط سطح المكتب */}
        <ul className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={`text-sm text-ink/65 transition-colors hover:text-burgundy ${font}`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2.5">
          {/* مبدّل اللغة */}
          <div className="flex overflow-hidden rounded-full border border-gold/40 bg-cream text-xs font-semibold shadow-sm">
            {["ar", "fr"].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => onSwitch(l)}
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

          <PrimaryButton
            href="/site/order"
            className={`hidden !px-5 !py-2 sm:inline-flex ${font}`}
          >
            {t.nav.cta}
          </PrimaryButton>

          {/* زر القائمة للجوال */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 bg-cream text-burgundy lg:hidden"
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none">
              {menuOpen ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* قائمة الجوال */}
      {menuOpen ? (
        <div className="border-t border-gold/20 bg-ivory/95 backdrop-blur-md lg:hidden">
          <ul className="mx-auto max-w-6xl space-y-1 px-5 py-4">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-xl px-4 py-2.5 text-sm text-ink/75 hover:bg-ivory-light ${font}`}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero({ lang, t }) {
  const arabic = lang === "ar";
  const font = arabic ? "font-arabicText" : "font-body";
  /* أرخص باقة — مصدر شارة "ابتداءً من" */
  const heroPrice = PRICING.reduce((a, b) => (b.price < a.price ? b : a));

  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-32 sm:px-8 sm:pt-36">
      {/* خلفية: توهجات ذهبية ناعمة */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-32 start-1/4 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute top-40 end-0 h-72 w-72 rounded-full bg-burgundy/5 blur-3xl" />
        {/* نجيمات ذهبية خفيفة */}
        {[
          ["12%", "22%"],
          ["85%", "18%"],
          ["70%", "55%"],
          ["20%", "70%"],
        ].map(([left, top], i) => (
          <motion.span
            key={i}
            className="absolute text-gold/50"
            style={{ left, top }}
            animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 3.5 + i, repeat: Infinity, delay: i * 0.7 }}
          >
            ✦
          </motion.span>
        ))}
      </div>

      <div className="relative mx-auto max-w-3xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className={`text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-gold-dark ${font}`}
        >
          {t.hero.kicker}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12 }}
          className={`mt-5 text-4xl leading-[1.25] text-burgundy-dark sm:text-5xl md:text-[3.4rem] ${
            arabic ? "font-arabicText font-bold" : "font-serif font-semibold"
          }`}
        >
          {t.hero.title1}
          <br />
          <span className="text-gold-dark">{t.hero.title2}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.24 }}
          className={`mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink/65 sm:text-lg ${font}`}
        >
          {t.hero.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.36 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <PrimaryButton href="#templates" className={font}>
            {t.hero.ctaPrimary}
            <span aria-hidden>{arabic ? "←" : "→"}</span>
          </PrimaryButton>
          <GhostButton href="/site/order" className={font}>
            {t.hero.ctaSecondary}
          </GhostButton>
        </motion.div>

        {/* شارة السعر — يظهر السعر خلال أول ثوانٍ دون تمرير */}
        <motion.a
          href="#pricing"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.44 }}
          className={`mt-6 inline-flex items-center gap-2.5 rounded-full border border-gold/45 bg-cream px-5 py-2.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gold ${font}`}
        >
          <span aria-hidden>✨</span>
          <span className="text-sm text-ink/65">{t.hero.priceFrom}</span>
          <span className="font-serif text-lg font-bold tabular-nums text-burgundy-dark">
            {formatDZD(heroPrice.price, lang)}
          </span>
          {heroPrice.oldPrice ? (
            <span className="text-xs text-ink/40 line-through tabular-nums">
              {formatDZD(heroPrice.oldPrice, lang)}
            </span>
          ) : null}
          <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[0.68rem] font-semibold text-gold-dark">
            {t.hero.priceNote}
          </span>
        </motion.a>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className={`mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-ink/50 ${font}`}
        >
          <span>💌 {t.hero.stat1}</span>
          <span className="text-gold" aria-hidden>
            ·
          </span>
          <span>🌿 {t.hero.stat2}</span>
          <span className="text-gold" aria-hidden>
            ·
          </span>
          <span>🌍 {t.hero.stat3}</span>
        </motion.div>
      </div>

      {/* جدار العرض المتحرك — بطاقات القوالب الحقيقية خلف هاتف مركزي */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.55 }}
        className="-mx-5 mt-10 sm:-mx-8"
      >
        <ShowcaseWall />
      </motion.div>

      <div className="mt-14">
        <Flourish />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* شريط التقييمات المتحرك                                              */
/* ------------------------------------------------------------------ */

function ReviewsTicker({ lang, t }) {
  const arabic = lang === "ar";
  const font = arabic ? "font-arabicText" : "font-body";
  // نكرّر القائمة مرتين لحلقة تمرير متصلة بلا قفزة
  const track = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="relative border-y border-gold/15 bg-ivory-light/50 py-10">
      {/* سطر التقييم العام */}
      <div
        className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-5 text-sm text-ink/60 ${font}`}
      >
        <span className="text-gold" aria-hidden>
          ★★★★★
        </span>
        <span className="font-serif text-base font-bold text-burgundy-dark">
          {REVIEWS_STRIP.rating}
        </span>
        <span className="text-gold" aria-hidden>
          ·
        </span>
        <span>{REVIEWS_STRIP.events[lang]}</span>
        <span className="text-gold" aria-hidden>
          ·
        </span>
        <span>{t.testimonials.strip}</span>
      </div>

      {/* المسار المتحرك — dir ثابت LTR حتى تبقى هندسة الحركة واحدة */}
      <div className="relative mt-7 overflow-hidden" dir="ltr">
        {/* تلاشي الحواف */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ivory to-transparent sm:w-28"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ivory to-transparent sm:w-28"
          aria-hidden
        />

        <div
          className={`flex w-max gap-4 pe-4 hover:[animation-play-state:paused] motion-reduce:animate-none ${
            arabic ? "animate-marqueeReverse" : "animate-marquee"
          }`}
        >
          {track.map((tm, i) => (
            <figure
              key={i}
              dir={t.dir}
              aria-hidden={i >= TESTIMONIALS.length}
              className="w-72 shrink-0 rounded-2xl border border-gold/20 bg-cream p-4 shadow-card sm:w-80"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-burgundy/10 font-serif text-[0.6rem] font-bold text-burgundy">
                  {tm.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-ink/85">
                    {tm.name}
                  </p>
                  <p className="text-[0.65rem] text-gold-dark" aria-hidden>
                    ★★★★★
                  </p>
                </div>
              </div>
              <blockquote
                className={`mt-2.5 text-xs leading-relaxed text-ink/65 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden ${font}`}
              >
                “{tm.text[lang]}”
              </blockquote>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* الفوتر                                                              */
/* ------------------------------------------------------------------ */

function Footer({ lang, t }) {
  const arabic = lang === "ar";
  const font = arabic ? "font-arabicText" : "font-body";
  const year = new Date().getFullYear();

  const product = [
    { href: "#templates", label: t.nav.templates },
    { href: "#pricing", label: t.nav.pricing },
    { href: "#features", label: t.nav.features },
  ];
  const support = [
    { href: "#faq", label: t.nav.faq },
    { href: "#contact", label: t.nav.contact },
    { href: `mailto:${SITE.email}`, label: SITE.email },
  ];

  return (
    <footer className="border-t border-gold/20 bg-gradient-to-b from-ivory to-ivory-dark/40 px-5 py-14 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/50 bg-cream font-monogram text-xl text-burgundy shadow-sm">
              {SITE.brandName.charAt(0)}
            </span>
            <span>
              <span className="block font-serif text-lg font-bold text-burgundy-dark">
                {SITE.brandName}
              </span>
              <span className="block font-arabicText text-xs text-gold-dark">
                {SITE.brandNameAr}
              </span>
            </span>
          </div>
          <p className={`mt-4 max-w-xs text-sm leading-relaxed text-ink/55 ${font}`}>
            {t.footer.about}
          </p>
          {(SITE.instagram || SITE.tiktok) && (
            <div className="mt-4 flex gap-3">
              {SITE.instagram ? (
                <a
                  href={`https://instagram.com/${SITE.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-burgundy/70 underline-offset-4 hover:underline"
                >
                  Instagram
                </a>
              ) : null}
              {SITE.tiktok ? (
                <a
                  href={`https://tiktok.com/@${SITE.tiktok}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-burgundy/70 underline-offset-4 hover:underline"
                >
                  TikTok
                </a>
              ) : null}
            </div>
          )}
        </div>

        <FooterCol title={t.footer.product} links={product} font={font} />
        <FooterCol title={t.footer.support} links={support} font={font} />
      </div>

      <div className="mx-auto mt-12 max-w-6xl border-t border-gold/15 pt-6 text-center">
        <p className={`text-xs text-ink/45 ${font}`}>
          © {year} {SITE.brandName} — {t.footer.rights} · {t.footer.madeWith} 🤍
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links, font }) {
  return (
    <div>
      <h3
        className={`text-xs font-semibold uppercase tracking-widest text-ink/45 ${font}`}
      >
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              className={`text-sm text-ink/65 transition-colors hover:text-burgundy ${font}`}
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
