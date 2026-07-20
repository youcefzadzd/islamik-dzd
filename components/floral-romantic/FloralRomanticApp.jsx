"use client";

/**
 * Floral Romantic template renderer — cinematic envelope intro rebuilt
 * from the owner's reference video:
 *
 *   deep-burgundy embossed-floral envelope (four folded panels) →
 *   panels part along an X reveal → a blush-and-gold butterfly flutters
 *   up and rests top-center on cream paper → "cordially invited" lines
 *   blur into focus → the couple's names in flowing script → the page.
 *
 * Consumes the same `initialData` (buildAllData output) as the other
 * templates: every wedding field, FR/AR + RTL and the RSVP flow work
 * unchanged. Own fixed palette (ignores owner theme colors), remapped
 * over the shared Tailwind tokens inside `.floral-root`:
 *   ivory→cream paper · gold→rose gold · burgundy→deep wine · ink→cocoa
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Cormorant_Garamond, Great_Vibes, Montserrat } from "next/font/google";
import { getData } from "@/lib/i18n";
import Reveal from "../Reveal";
import MusicPlayer from "../MusicPlayer";
import FloralRomanticRsvp from "./FloralRomanticRsvp";
import { FLORAL_DEFAULTS, getDisplayText, toFormalName } from "./defaults";

const scriptFont = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-floral-script",
  display: "swap",
});

const serifFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-floral-serif",
  display: "swap",
});

const sansFont = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-floral-sans",
  display: "swap",
});

/* template artwork — this template's own, never owner-editable */
const ASSETS = {
  envelope: "/assets/templates/floral-romantic/envelope-texture.webp",
  envelopeClosed: "/assets/templates/floral-romantic/envelope-closed.webp",
  butterfly: "/assets/templates/floral-romantic/butterfly.png",
  seal: "/assets/templates/floral-romantic/wax-seal.png",
  scene: "/assets/templates/floral-romantic/reveal-scene.webp",
  sceneVideo: "/assets/templates/floral-romantic/reveal-scene.mp4",
};

/* palette measured from the reference video: deep wine embossed paper,
   cream inner sheet, rose-gold accents, warm cocoa text */
const FLORAL_VARS = `
.floral-root {
  --color-white: 255 255 255;
  --color-ivory: 243 239 230;
  --color-ivory-light: 250 248 242;
  --color-ivory-dark: 232 226 213;
  --color-gold: 198 143 123;
  --color-gold-light: 233 205 192;
  --color-gold-dark: 164 106 86;
  --color-emerald: 92 31 43;
  --color-emerald-light: 122 52 65;
  --color-emerald-dark: 61 18 27;
  --color-ink: 58 47 47;
  --color-burgundy: 92 31 43;
  --color-burgundy-light: 122 52 65;
  --color-burgundy-dark: 61 18 27;
}

/* whisper-soft cream wash + paper grain for the light sections */
.floral-root .fl-soft-bg {
  background-image:
    radial-gradient(90% 55% at 50% 0%, rgb(250 248 242 / 0.85), transparent 65%),
    radial-gradient(60% 42% at 10% 100%, rgb(233 205 192 / 0.16), transparent 72%),
    radial-gradient(55% 38% at 92% 88%, rgb(198 143 123 / 0.08), transparent 70%),
    repeating-linear-gradient(115deg, rgb(164 106 86 / 0.016) 0 2px, transparent 2px 7px);
}

/* shared button feel: soft lift on hover, gentle press */
.floral-root .fl-btn {
  transition: transform 0.25s ease, box-shadow 0.25s ease,
    background-color 0.25s ease, border-color 0.25s ease, opacity 0.25s ease;
  box-shadow: 0 2px 10px rgb(58 47 47 / 0.05);
}
.floral-root .fl-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgb(58 47 47 / 0.1);
}
.floral-root .fl-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgb(58 47 47 / 0.08);
}

/* music button (shared MusicPlayer, styled from outside only) */
.floral-root .fixed.bottom-4.right-4 {
  background: rgb(250 248 242 / 0.55);
  border-color: rgb(198 143 123 / 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 6px 22px rgb(58 47 47 / 0.12), inset 0 1px 0 rgb(255 255 255 / 0.55);
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
}
.floral-root .fixed.bottom-4.right-4:hover {
  background: rgb(250 248 242 / 0.75);
  transform: translateY(-1px);
}
.floral-root .fixed.bottom-4.right-4:active {
  transform: scale(0.96);
}

/* butterfly wing-flutter: a horizontal squash that reads as wings
   closing and opening — fast while flying, slow once landed */
@keyframes fl-flutter {
  0%, 100% { transform: scaleX(1); }
  50% { transform: scaleX(0.72); }
}
.floral-root .fl-flutter-fast { animation: fl-flutter 0.42s ease-in-out infinite; }
.floral-root .fl-flutter-slow { animation: fl-flutter 3.6s ease-in-out infinite; }

/* the gentlest of bounces — scroll arrow only */
@keyframes fl-arrow-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(4px); }
}
.floral-root .fl-arrow-bob { animation: fl-arrow-bob 2.4s ease-in-out infinite; }

/* tap-hint pulse on the closed envelope */
@keyframes fl-hint-pulse {
  0%, 100% { opacity: 0.85; }
  50% { opacity: 0.45; }
}
.floral-root .fl-hint-pulse { animation: fl-hint-pulse 2.6s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .floral-root .fl-flutter-fast,
  .floral-root .fl-flutter-slow,
  .floral-root .fl-arrow-bob,
  .floral-root .fl-hint-pulse { animation: none; }
}`;

/* template chrome that is not owner-editable, per language */
const UI = {
  fr: {
    open: "Touchez pour ouvrir",
    weddingOf: "Le Mariage De",
    invited1: "Vous êtes",
    invited2: "Cordialement",
    invited3: "Invités",
    married: "Nous nous marions",
    fatherPrefix: "Monsieur ",
    fatherSuffix: "",
    motherPrefix: "et son épouse ",
    son: "leur fils",
    daughter: "leur fille",
    programSub: "Ce que nous avons préparé pour vous",
    rsvpCta: "Confirmer votre présence",
    galleryEyebrow: "Nos souvenirs",
    galleryTitle: "Notre Galerie",
    gallerySub: "Quelques instants précieux que nous souhaitons partager avec vous",
    calendar: "Ajouter la date à votre calendrier",
    map: "Itinéraire",
    questions: "Questions ?",
    call: "Appeler",
    madeWith: "Fait avec",
    forOurDay: "pour notre jour spécial",
  },
  ar: {
    open: "اضغطوا للفتح",
    weddingOf: "حفل زفاف",
    invited1: "بكل حب",
    invited2: "ندعوكم",
    invited3: "لحضور زفافنا",
    married: "حفل زفافنا",
    fatherPrefix: "السيد ",
    fatherSuffix: " وحرمه",
    motherPrefix: "",
    son: "ابنهما",
    daughter: "ابنتهما",
    programSub: "ما أعددناه لكم في هذا اليوم المميز",
    rsvpCta: "تأكيد الحضور",
    galleryEyebrow: "ذكرياتنا",
    galleryTitle: "لحظات من فرحتنا",
    gallerySub: "ذكريات نحب أن نشاركها معكم",
    calendar: "أضف الموعد إلى تقويم هاتفك",
    map: "الاتجاهات",
    questions: "أسئلة؟",
    call: "اتصال",
    madeWith: "صُنع بـ",
    forOurDay: "من أجل يومنا المميز",
  },
};

const EASE = [0.22, 1, 0.36, 1];
const sansClass = "[font-family:var(--font-floral-sans)]";
const serifClass = (lang) =>
  lang === "ar" ? "font-arabicText" : "[font-family:var(--font-floral-serif)]";
const scriptClass = (lang) =>
  lang === "ar" ? "font-arabicText" : "[font-family:var(--font-floral-script)]";

/* universal Save-the-Date: a downloaded .ics opens Apple Calendar on
   iPhone and Google Calendar on Android — no account or app assumptions.
   Times are written as floating local time so the event shows at the
   venue's wall-clock hour on every device. */
function downloadIcs(data) {
  const iso = data.event.dateTimeISO;
  if (!iso) return;
  const start = new Date(iso);
  if (Number.isNaN(start.getTime())) return;
  const end = new Date(start.getTime() + 5 * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  const fmt = (d) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const esc = (s) => String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const title = `${data.couple.groomName} & ${data.couple.brideName}`;
  const location = [data.location.venueName, data.location.address].filter(Boolean).join(", ");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Floral Romantic//Wedding//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${data.rsvp.weddingId || "wedding"}-${fmt(start)}@floral-romantic`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(title)}`,
    `LOCATION:${esc(location)}`,
    `DESCRIPTION:${esc(data.seo?.title || title)}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "save-the-date.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/* محطة برنامج حية: تشتعل عند وصول تقدم التمرير إليها — البطاقة
   تسطع وحدها الذهبي، رقاقة الوقت تتذهّب، والسطر يرتفع قليلًا */
function FloralProgramRow({ step, lang, progress, center, span, cardRef }) {
  const t = useTransform(progress, [center - span, center + 0.02], [0, 1]);
  const bg = useTransform(t, [0, 1], ["rgba(255, 255, 255, 0.06)", "rgba(255, 255, 255, 0.14)"]);
  const borderColor = useTransform(
    t,
    [0, 1],
    ["rgba(255, 255, 255, 0.1)", "rgba(226, 190, 138, 0.6)"]
  );
  const lift = useTransform(t, [0, 1], [0, -3]);
  const opacity = useTransform(t, [0, 1], [0.78, 1]);
  const chipBg = useTransform(t, [0, 1], ["#F6EFE3", "#EBD3A4"]);
  return (
    <motion.div
      ref={cardRef}
      style={{ y: lift, opacity, backgroundColor: bg, borderColor }}
      className="flex items-center gap-5 rounded-2xl border px-5 py-4 backdrop-blur-[2px]"
    >
      <motion.span
        style={{ backgroundColor: chipBg }}
        className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide text-burgundy ${sansClass}`}
        dir="ltr"
      >
        {step.time}
      </motion.span>
      <div className="text-start">
        <p className={`text-lg text-ivory-light ${serifClass(lang)}`}>{step.title}</p>
        {step.description && (
          <p className={`mt-0.5 text-sm leading-relaxed text-ivory-light/70 ${serifClass(lang)}`}>
            {step.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}

/* مسار البرنامج المتحرك: خيط ذهبي يمتلئ مع التمرير وقلب متوهج
   يسافر بين المحطات نزولًا وصعودًا (زنبرك ناعم) */
function FloralProgramList({ program, lang }) {
  const listRef = useRef(null);
  const cardRefs = useRef([]);
  const [geo, setGeo] = useState(null); // {x, top, height, fracs[]}
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 72%", "end 42%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 70, damping: 22, mass: 0.4 });
  const heartTop = useTransform(progress, (v) => (geo ? geo.top + v * geo.height : 0));

  useEffect(() => {
    const measure = () => {
      const c = listRef.current;
      if (!c || !c.offsetHeight) return;
      const centers = cardRefs.current.slice(0, program.length).map((el) => {
        if (!el) return null;
        let top = 0;
        let n = el;
        while (n && n !== c) {
          top += n.offsetTop;
          n = n.offsetParent;
        }
        return top + el.offsetHeight / 2;
      });
      if (centers.some((p) => p === null) || centers.length < 2) return;
      const top = centers[0];
      const bottom = centers[centers.length - 1];
      setGeo({
        top,
        height: bottom - top,
        fracs: centers.map((y) => (y - top) / (bottom - top)),
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [program.length]);

  const span = 0.6 / Math.max(program.length, 1);

  return (
    <div ref={listRef} className="relative mx-auto mt-12 max-w-lg ps-7">
      {geo && (
        <>
          {/* الخيط: مسار باهت + امتلاء ذهبي يتبع التمرير */}
          <div
            aria-hidden
            className="pointer-events-none absolute start-2 w-px bg-white/15"
            style={{ top: geo.top, height: geo.height }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute start-2 w-[2px]"
            style={{
              top: geo.top,
              height: geo.height,
              transformOrigin: "top",
              scaleY: progress,
              background:
                "linear-gradient(180deg, rgba(235, 211, 164, 0.95), rgba(235, 211, 164, 0.45))",
            }}
          />
          {/* القلب المتوهج المسافر — إزاحة التمركز تتبع اتجاه اللغة */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute z-10"
            style={{
              insetInlineStart: "0.5rem",
              top: heartTop,
              x: lang === "ar" ? "46%" : "-46%",
              y: "-50%",
            }}
          >
            <span
              className="block text-[13px] leading-none"
              style={{
                color: "#F6EFE3",
                textShadow:
                  "0 0 10px rgba(246, 239, 227, 0.9), 0 0 24px rgba(235, 211, 164, 0.55)",
              }}
            >
              ♥
            </span>
          </motion.div>
        </>
      )}
      <div className="flex flex-col gap-5">
        {program.map((step, i) => (
          <Reveal key={i} delay={i * 0.08}>
            <FloralProgramRow
              step={step}
              lang={lang}
              progress={progress}
              center={geo ? geo.fracs[i] : (i + 0.5) / program.length}
              span={span}
              cardRef={(el) => (cardRefs.current[i] = el)}
            />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function hashtagOf(data) {
  const latin = (main, alt) => (/[A-Za-z]/.test(main || "") ? main : alt || main || "");
  const a = latin(data.couple.groomName, data.couple.groomNameAr).trim().split(/\s+/)[0];
  const b = latin(data.couple.brideName, data.couple.brideNameAr).trim().split(/\s+/)[0];
  if (!a || !b || !/[A-Za-z]/.test(a + b)) return null;
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  // {a, b} للعرض المزخرف — النص المنسوخ يبقى #AAndB هاشتاغًا واحدًا
  return { a: cap(a), b: cap(b) };
}

/* ---------- small ornaments ---------- */

function RoseDivider({ className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-gold ${className}`} aria-hidden>
      <span className="h-px w-16 bg-gold/50 sm:w-24" />
      {/* two interlocked hearts, hand-drawn line style */}
      <svg
        width="30"
        height="17"
        viewBox="0 0 60 34"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 29C11.5 22.2 6.5 16 6.5 11.4 6.5 7.3 9.6 4.5 13 4.5c2.6 0 5 1.5 7 4.2 2-2.7 4.4-4.2 7-4.2 3.4 0 6.5 2.8 6.5 6.9 0 4.6-5 10.8-13.5 17.6Z" />
        <path
          d="M41 31.5c-7.3-5.9-11.6-11.2-11.6-15.2 0-3.5 2.7-6 5.6-6 2.2 0 4.3 1.3 6 3.6 1.7-2.3 3.8-3.6 6-3.6 2.9 0 5.6 2.5 5.6 6 0 4-4.3 9.3-11.6 15.2Z"
          opacity="0.65"
          strokeWidth="2"
        />
      </svg>
      <span className="h-px w-16 bg-gold/50 sm:w-24" />
    </div>
  );
}

function SectionHeading({ eyebrow, title, lang, tone = "dark" }) {
  const toneCls = tone === "light" ? "text-ivory-light" : "text-burgundy";
  return (
    <div className="text-center">
      {eyebrow && (
        <p
          className={`text-[0.68rem] uppercase tracking-[0.42em] ${
            tone === "light" ? "text-gold-light" : "text-gold-dark"
          } ${sansClass}`}
        >
          {eyebrow}
        </p>
      )}
      <h2 className={`mt-3 text-3xl sm:text-4xl ${toneCls} ${serifClass(lang)}`}>{title}</h2>
      <RoseDivider className="mt-5" />
    </div>
  );
}

/* ---------- the envelope intro (the reference video, rebuilt) ---------- */

/* one half of the closed envelope — a vertical slice of the AI photo
   that is pulled straight out to its side, like a door sliding open */
function EnvelopeHalf({ clip, open, toX, delay, reduceMotion, children }) {
  return (
    <motion.div
      className="absolute inset-0"
      initial={false}
      animate={open ? { x: toX } : { x: 0 }}
      transition={{
        duration: reduceMotion ? 0.5 : 1.35,
        delay: reduceMotion ? 0 : delay,
        ease: [0.45, 0, 0.22, 1],
      }}
      style={{ filter: "drop-shadow(0 0 30px rgb(30 8 13 / 0.5))" }}
    >
      <div
        className="absolute inset-0"
        style={{
          clipPath: clip,
          backgroundImage: `url(${ASSETS.envelopeClosed})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {children}
    </motion.div>
  );
}

/* the sealed envelope (owner's spec): a full-bleed AI photograph of a
   classic burgundy envelope with visible X folds and the gold wax seal
   at dead center — no ribbon. On tap the RIGHT half is pulled straight
   out to the right, the seal stuck to it; then the LEFT half is pulled
   out to the left, revealing the letter. */
function SealedEnvelope({ opened, reduceMotion }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {/* soft light on the letter as the halves part */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={opened ? { opacity: [0, 0.55, 0] } : { opacity: 0 }}
        transition={{
          duration: reduceMotion ? 0.6 : 1.6,
          delay: reduceMotion ? 0 : 0.25,
          times: [0, 0.4, 1],
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(95% 75% at 50% 42%, rgb(255 250 240 / 0.9), rgb(255 245 230 / 0.35) 55%, transparent 85%)",
        }}
      />

      {/* LEFT piece — everything but the right triangle; its right edge
          is a "<" notch whose vertex starts at dead center. It follows,
          pulled out to the left. */}
      <EnvelopeHalf
        clip="polygon(-1% -1%, 101% -1%, 50% 50%, 101% 101%, -1% 101%)"
        open={opened}
        toX="-118vw"
        delay={0.1}
        reduceMotion={reduceMotion}
      />

      {/* RIGHT piece — leads: a pure triangle whose TIP is at dead
          center, exactly under the wax seal; the seal rides the tip as
          the piece is pulled out to the right (the reference look). */}
      <EnvelopeHalf
        clip="polygon(50% 50%, 101% -1%, 101% 101%)"
        open={opened}
        toX="118vw"
        delay={0.1}
        reduceMotion={reduceMotion}
      >
        <img
          src={ASSETS.seal}
          alt=""
          draggable={false}
          className="absolute left-1/2 top-1/2 w-[30vw] max-w-[150px] -translate-x-1/2 -translate-y-1/2 select-none"
          style={{ filter: "drop-shadow(0 6px 16px rgb(30 8 13 / 0.45))" }}
        />
      </EnvelopeHalf>
    </div>
  );
}

function FloralIntro({ ui, opened, onOpen, reduceMotion }) {
  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      {/* this overlay holds ONLY the sealed envelope and the tap hint:
          the scene video is a permanent fixed layer behind it, and all
          text belongs to the hero — it appears exactly once and stays */}

      {/* the sealed envelope, resting on the paper */}
      <SealedEnvelope opened={opened} reduceMotion={reduceMotion} />

      {/* tap layer + hint (closed state only) */}
      {!opened && (
        <button
          type="button"
          onClick={onOpen}
          aria-label={ui.open}
          className="absolute inset-0 z-30 flex cursor-pointer items-end justify-center bg-transparent pb-14"
        >
          <span
            className={`fl-hint-pulse rounded-full border border-burgundy/25 bg-[rgb(30_8_13/0.45)] px-6 py-2.5 text-[0.72rem] uppercase tracking-[0.35em] text-[#F3E3DC] backdrop-blur-sm ${sansClass}`}
          >
            {ui.open}
          </span>
        </button>
      )}
    </div>
  );
}

/* ---------- countdown ---------- */

function FloralCountdown({ data }) {
  const target = useMemo(() => new Date(data.event.dateTimeISO), [data.event.dateTimeISO]);
  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (Number.isNaN(target.getTime()) || diff <= 0) return null;
    const s = Math.floor(diff / 1000);
    return {
      days: Math.floor(s / 86400),
      hours: Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60,
    };
  };
  /* undefined until mounted — Date.now() must never run during SSR or
     hydration would mismatch on the seconds cell */
  const [left, setLeft] = useState(undefined);
  useEffect(() => {
    setLeft(calc());
    const id = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.event.dateTimeISO]);

  const labels = data.countdown.labels || {};
  if (left === null)
    return (
      <p className={`mt-10 text-lg text-burgundy ${serifClass(data.lang)}`}>
        {data.countdown.expiredText}
      </p>
    );

  const cells = [
    { v: left?.days, l: labels.days },
    { v: left?.hours, l: labels.hours },
    { v: left?.minutes, l: labels.minutes },
    { v: left?.seconds, l: labels.seconds },
  ];
  return (
    <div className="mt-10 flex items-center justify-center gap-1.5 sm:gap-2.5" dir="ltr">
      {cells.map((c, i) => (
        <div key={i} className="flex items-center gap-1.5 sm:gap-2.5">
          {/* champagne-glass plaque: hairline rose-gold double frame,
              engraved serif numerals, gilded rule above the label */}
          <div
            className="relative flex w-[72px] flex-col items-center rounded-[18px] px-2 pb-3 pt-3.5 sm:w-[88px] sm:pb-4 sm:pt-5"
            style={{
              background:
                "linear-gradient(165deg, rgb(255 253 248 / 0.88), rgb(247 238 226 / 0.68))",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgb(198 143 123 / 0.5)",
              boxShadow:
                "0 14px 34px rgb(76 27 38 / 0.16), inset 0 1px 0 rgb(255 255 255 / 0.85), inset 0 0 0 3px rgb(255 255 255 / 0.35)",
            }}
          >
            {/* inner hairline ring for the double-frame engraving look */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-[4px] rounded-[14px]"
              style={{ border: "1px solid rgb(198 143 123 / 0.28)" }}
            />
            <span
              className={`text-[30px] leading-none text-burgundy sm:text-4xl ${serifClass("fr")}`}
              style={{ fontVariantNumeric: "tabular-nums", textShadow: "0 1px 0 rgb(255 255 255 / 0.6)" }}
            >
              {c.v === undefined ? "--" : String(c.v).padStart(2, "0")}
            </span>
            <span aria-hidden className="mt-2 h-px w-7 bg-gold/50 sm:w-9" />
            <span
              className={`mt-1.5 text-[0.56rem] uppercase tracking-[0.22em] text-gold-dark sm:text-[0.62rem] ${sansClass}`}
            >
              {c.l}
            </span>
          </div>
          {/* delicate gilded diamond between the plaques */}
          {i < cells.length - 1 && (
            <svg width="7" height="7" viewBox="0 0 10 10" className="shrink-0 text-gold/70" fill="currentColor" aria-hidden>
              <path d="M5 0 10 5 5 10 0 5Z" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

/* ---------- main ---------- */

export default function FloralRomanticApp({ weddingIdOverride, initialData }) {
  const [opened, setOpened] = useState(false); // envelope tapped
  const [revealed, setRevealed] = useState(false); // main page visible
  const [introGone, setIntroGone] = useState(false); // intro unmounted

  const defaultLang = initialData?.fr?.defaultLang || "fr";
  const enabledLangs = initialData?.fr?.enabledLangs || ["fr", "ar"];
  const [lang, setLang] = useState(defaultLang);
  const [textFading, setTextFading] = useState(false);
  const reduceMotion = useReducedMotion();
  const sceneVideoRef = useRef(null);

  /* the journey plays ONCE from the tap and freezes on its final
     frame; if the tab was hidden mid-open, resume when visible */
  useEffect(() => {
    if (!opened) return;
    const tryPlay = () => {
      if (document.visibilityState === "visible")
        sceneVideoRef.current?.play?.().catch(() => {});
    };
    document.addEventListener("visibilitychange", tryPlay);
    tryPlay();
    return () => document.removeEventListener("visibilitychange", tryPlay);
  }, [opened]);

  const data = useMemo(() => {
    const base = initialData ? initialData[lang] || initialData.fr : getData(lang);
    return weddingIdOverride
      ? { ...base, rsvp: { ...base.rsvp, weddingId: weddingIdOverride } }
      : base;
  }, [lang, weddingIdOverride, initialData]);

  const ui = UI[lang] || UI.fr;
  const DEF = FLORAL_DEFAULTS[lang] || FLORAL_DEFAULTS.fr;
  const hashtag = useMemo(() => hashtagOf(data), [data]);

  const names = {
    groom: getDisplayText(data.couple.groomName, DEF.groomName),
    bride: getDisplayText(data.couple.brideName, DEF.brideName),
  };

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved && saved !== defaultLang && enabledLangs.includes(saved)) setLang(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    document.body.style.overflow = introGone ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [introGone]);

  /* intro → page hand-off: the envelope halves are gone by ~1.6s, the
     overlay dissolves right after — the video journey keeps playing
     behind while the hero's texts fade in as the camera settles */
  useEffect(() => {
    if (!opened) return;
    const revealAt = reduceMotion ? 900 : 2000;
    const t1 = setTimeout(() => setRevealed(true), revealAt);
    const t2 = setTimeout(() => setIntroGone(true), revealAt + 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  function switchLang() {
    const next = lang === "fr" ? "ar" : "fr";
    setTextFading(true);
    setTimeout(() => {
      setLang(next);
      localStorage.setItem("lang", next);
      setTextFading(false);
    }, 200);
  }

  const program = data.schedule.items || [];
  /* owner photos when they exist; the base config's /assets/gallery/
     demo shots are Islamic Royal chrome and must never leak in here —
     with no owner photos the section simply hides */
  const galleryImages = useMemo(
    () =>
      (data.gallery?.images || [])
        .filter((im) => im?.src && !im.src.startsWith("/assets/gallery/"))
        .slice(0, 8),
    [data]
  );

  /* Wedding Invitation section: owner's words, template defaults */
  const invSaved = data.invitation || {};
  const inv = {
    honoreeGender:
      invSaved.honoreeGender === "male" || invSaved.honoreeGender === "female"
        ? invSaved.honoreeGender
        : "",
    basmala: getDisplayText(invSaved.basmala, FLORAL_DEFAULTS.basmala),
    fatherName: toFormalName(getDisplayText(invSaved.fatherName)),
    motherName: toFormalName(getDisplayText(invSaved.motherName)),
    invitationText: getDisplayText(invSaved.invitationText, DEF.invitationText),
    mainTitle: getDisplayText(invSaved.mainTitle, lang === "ar" ? DEF.invitationTitle : ""),
    dateIntro: getDisplayText(invSaved.dateIntro, DEF.dateIntro),
    weddingDate: getDisplayText(invSaved.weddingDate, data.event.displayDate),
    time: getDisplayText(invSaved.time, data.event.displayTime),
    hallIntro: getDisplayText(invSaved.hallIntro, DEF.hallIntro),
    hallName: getDisplayText(invSaved.hallName, data.location.venueName || ""),
    footerMessage: getDisplayText(invSaved.footerMessage),
  };

  const contactPhone = getDisplayText(data.contact?.phone);
  const contactWhatsapp = getDisplayText(data.contact?.whatsapp).replace(/[^\d+]/g, "");

  return (
    <div
      className={`floral-root ${scriptFont.variable} ${serifFont.variable} ${sansFont.variable}`}
    >
      <style dangerouslySetInnerHTML={{ __html: FLORAL_VARS }} />

      {/* language pill (🌐 FR / AR) */}
      {enabledLangs.length > 1 && (
        <button
          type="button"
          onClick={switchLang}
          className={`fl-btn fixed right-4 top-4 z-[70] flex items-center gap-1.5 rounded-full border border-gold/40 bg-ivory-light/60 px-4 py-1.5 text-sm text-ink/80 shadow-[0_6px_22px_rgb(58_47_47_/_0.12)] backdrop-blur-md hover:bg-ivory-light/80 ${
            lang === "fr" ? "font-arabicText" : sansClass
          }`}
          aria-label={lang === "fr" ? "التبديل إلى العربية" : "Passer au français"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" />
          </svg>
          {lang === "fr" ? "العربية" : "FR"}
        </button>
      )}

      <div className={`transition-opacity duration-300 ${textFading ? "opacity-0" : "opacity-100"}`}>
        {/* THE scene — one permanent fixed video layer behind everything,
            from the sealed envelope to the hero: it never swaps, so no
            "shot change" can ever appear. It plays once from the tap
            and freezes on its final composition. */}
        <div aria-hidden className="fixed inset-0" style={{ backgroundColor: "#F3EFE6" }}>
          <video
            ref={sceneVideoRef}
            src={ASSETS.sceneVideo}
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover object-bottom"
          />
        </div>

        {!introGone && (
          <motion.div
            initial={false}
            animate={revealed ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            style={{ pointerEvents: revealed ? "none" : "auto" }}
          >
            <FloralIntro
              ui={ui}
              opened={opened}
              onOpen={() => {
                /* the tap is a user gesture — guarantees playback */
                sceneVideoRef.current?.play?.().catch(() => {});
                setOpened(true);
              }}
              reduceMotion={reduceMotion}
            />
          </motion.div>
        )}

        <main className="relative text-ink">
          {/* HERO — the living Burgundy Royale scene IS the main shot:
              the same video keeps playing behind the names, date and
              countdown, so the reveal flows into the page seamlessly */}
          <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-20 pt-24 text-center">
            {/* transparent over the permanent fixed video layer — only a
                soft light pocket behind the text block for readability */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(80% 42% at 50% 40%, rgb(250 246 238 / 0.55), transparent 75%)",
              }}
            />
            <div className="relative flex w-full flex-col items-center">
              {[
                lang === "ar" ? (
                  /* «يوم الزفاف» بخط عربي أنيق: أميري كبير برونزي
                     تحفّه شعيرتان — لا تباعد أحرف لاتيني */
                  <div key="eyebrow" className="flex items-center justify-center gap-3 text-[#8A6A55]">
                    <span aria-hidden className="h-px w-12 bg-[#8A6A55]/40" />
                    <p className="font-arabicText text-[1.7rem] leading-snug drop-shadow-sm">
                      {getDisplayText(data.hero.eyebrow, DEF.heroEyebrow)}
                    </p>
                    <span aria-hidden className="h-px w-12 bg-[#8A6A55]/40" />
                  </div>
                ) : (
                  <p
                    key="eyebrow"
                    className={`text-[0.72rem] uppercase tracking-[0.4em] text-[#8A6A55] ${sansClass}`}
                  >
                    {getDisplayText(data.hero.eyebrow, DEF.heroEyebrow)}
                  </p>
                ),
                <h1
                  key="names"
                  className={`mt-6 text-5xl leading-tight text-[#6B2737] sm:text-7xl ${scriptClass(lang)}`}
                >
                  {names.groom}
                  <span className={`mx-3 align-middle text-4xl text-[#9E5E68] sm:text-5xl ${scriptClass("fr")}`}>
                    &amp;
                  </span>
                  {names.bride}
                </h1>,
                <RoseDivider key="ornament" className="mt-7 w-64" />,
                <p
                  key="date"
                  className={`mt-6 text-sm uppercase tracking-[0.35em] text-[#5C4A42] ${sansClass}`}
                >
                  {getDisplayText(data.event.displayDate, DEF.heroDate)}
                </p>,
                <FloralCountdown key="countdown" data={data} />,
              ].map((el, i) => (
                <motion.div
                  key={el.key}
                  className="flex w-full justify-center"
                  initial={{ opacity: 0, y: 26 }}
                  animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }}
                  transition={{
                    duration: 0.9,
                    /* revealed fires at ~2s; the texts START blurring in
                       at ~3s — while the camera is still gliding — and
                       are fully sharp right as the 4s journey stops */
                    delay: (reduceMotion ? 0.2 : 1.0) + i * (reduceMotion ? 0.05 : 0.2),
                    ease: EASE,
                  }}
                >
                  {el}
                </motion.div>
              ))}

              {data.rsvp.enabled && (
                <motion.button
                  type="button"
                  onClick={() =>
                    document.getElementById("rsvp")?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                  initial={{ opacity: 0 }}
                  animate={revealed ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.8, delay: reduceMotion ? 0.5 : 2.8 }}
                  className={`group mt-14 flex flex-col items-center gap-2 text-[0.66rem] uppercase tracking-[0.35em] text-gold-dark ${sansClass}`}
                >
                  {ui.rsvpCta}
                  <span className="h-6 w-px bg-gold/50" />
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="fl-arrow-bob"
                    aria-hidden
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </motion.button>
              )}
            </div>
          </section>

          {/* everything below the hero sits on the cream paper again,
              covering the fixed video layer while scrolling */}
          <div className="fl-soft-bg bg-ivory">
          {/* INVITATION — basmala, parents, the owner's own words */}
          <section className="relative px-4 py-20 sm:py-24">
            <Reveal className="mx-auto max-w-xl">
              <div className="relative rounded-[32px] border border-gold/25 bg-white/80 px-7 py-12 text-center shadow-[0_24px_60px_rgb(76_27_38_/_0.1)] sm:px-12">
                {/* embossed burgundy corner blooms, echoing the envelope */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-2 rounded-t-[32px]"
                  style={{
                    background:
                      "linear-gradient(90deg, rgb(92 31 43 / 0.85), rgb(122 52 65 / 0.6), rgb(92 31 43 / 0.85))",
                  }}
                />
                {inv.basmala && (
                  <p className="font-arabicText text-xl leading-relaxed text-burgundy">{inv.basmala}</p>
                )}
                {inv.mainTitle && (
                  <p className={`mt-6 text-3xl text-burgundy ${serifClass(lang)}`}>{inv.mainTitle}</p>
                )}
                <RoseDivider className="mt-6" />

                {(inv.fatherName || inv.motherName) && (
                  <p className={`mt-8 text-xl leading-relaxed text-ink ${serifClass(lang)}`}>
                    {inv.fatherName && (
                      <>
                        {ui.fatherPrefix}
                        <span className="font-semibold">{inv.fatherName}</span>
                        {ui.fatherSuffix}
                      </>
                    )}
                    {inv.motherName && (
                      <>
                        {inv.fatherName ? " " : ""}
                        {ui.motherPrefix}
                        <span className="font-semibold">{inv.motherName}</span>
                      </>
                    )}
                  </p>
                )}

                <p className={`mt-5 text-lg leading-relaxed text-ink/80 ${serifClass(lang)}`}>
                  {inv.invitationText}
                </p>

                {inv.honoreeGender && (
                  <p className={`mt-2 text-lg italic text-gold-dark ${serifClass(lang)}`}>
                    {inv.honoreeGender === "male" ? ui.son : ui.daughter}
                  </p>
                )}

                <div className={`mt-7 leading-tight text-[#6E5A55] ${scriptClass(lang)}`}>
                  <p className="text-4xl sm:text-5xl">{names.groom}</p>
                  <p className={`my-1 text-3xl text-gold ${scriptClass("fr")}`}>&amp;</p>
                  <p className="text-4xl sm:text-5xl">{names.bride}</p>
                </div>

                <RoseDivider className="mt-8" />

                <p className={`mt-7 text-[1.05rem] leading-relaxed text-ink/80 ${serifClass(lang)}`}>
                  {inv.dateIntro}
                </p>
                <p className={`mt-2 text-2xl text-burgundy ${serifClass(lang)}`}>
                  {inv.weddingDate}
                  {inv.time && <span className="mx-2 text-gold">·</span>}
                  {inv.time}
                </p>
                {inv.hallName && (
                  <p className={`mt-3 text-[1.05rem] leading-relaxed text-ink/80 ${serifClass(lang)}`}>
                    {inv.hallIntro} <span className="font-semibold text-ink">{inv.hallName}</span>
                  </p>
                )}
              </div>
            </Reveal>
          </section>

          {/* PROGRAM — deep-burgundy band, embossed feel, cream time chips */}
          {program.length > 0 && (
            <section
              className="relative overflow-hidden px-4 py-20 sm:py-24"
              style={{
                backgroundImage: `linear-gradient(rgb(61 18 27 / 0.88), rgb(61 18 27 / 0.92)), url(${ASSETS.envelope})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <Reveal>
                <SectionHeading title={data.schedule.heading} eyebrow={ui.programSub} lang={lang} tone="light" />
              </Reveal>
              {/* مسار متحرك: خيط يمتلئ، قلب يسافر، وبطاقات تشتعل تباعًا */}
              <FloralProgramList program={program} lang={lang} />
            </section>
          )}

          {/* LOCATION — venue card with Maps / Calendar buttons */}
          <section className="px-4 py-20 sm:py-24">
            <Reveal>
              <SectionHeading title={data.location.heading} lang={lang} />
            </Reveal>
            <Reveal delay={0.1} className="mx-auto mt-10 max-w-md">
              <div className="rounded-[28px] border border-gold/25 bg-white/85 px-7 py-10 text-center shadow-[0_18px_50px_rgb(76_27_38_/_0.1)]">
                <span
                  aria-hidden
                  className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-burgundy/10 text-burgundy"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                {data.location.venueName && (
                  <p className={`text-2xl text-burgundy ${serifClass(lang)}`}>{data.location.venueName}</p>
                )}
                {data.location.address && (
                  <p className={`mt-3 text-[1.02rem] leading-relaxed text-ink/75 ${serifClass(lang)}`}>
                    {data.location.address}
                  </p>
                )}

                {/* embedded Google Map — shown whenever the owner saved
                    an embed URL in the dashboard; hidden otherwise */}
                {data.location.mapEmbedUrl && (
                  <div
                    className="mt-7 overflow-hidden rounded-2xl border border-gold/35"
                    style={{ boxShadow: "0 12px 32px rgb(76 27 38 / 0.14), inset 0 0 0 3px rgb(255 255 255 / 0.6)" }}
                  >
                    <iframe
                      src={data.location.mapEmbedUrl}
                      title="Google Maps"
                      className="block h-56 w-full sm:h-64"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                )}

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  {data.location.mapLinkUrl && (
                    <a
                      href={data.location.mapLinkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`fl-btn inline-flex items-center justify-center gap-2 rounded-xl bg-burgundy px-6 py-3 text-[15px] font-medium text-white hover:bg-burgundy-dark ${sansClass}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {ui.map}
                    </a>
                  )}
                  {data.event.dateTimeISO && (
                    <button
                      type="button"
                      onClick={() => downloadIcs(data)}
                      className={`fl-btn inline-flex items-center justify-center gap-2 rounded-xl border border-burgundy/30 px-6 py-3 text-[15px] font-medium text-burgundy hover:bg-burgundy/5 ${sansClass}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <path d="M16 2v4M8 2v4M3 10h18M12 13v6M9 16h6" />
                      </svg>
                      {ui.calendar}
                    </button>
                  )}
                </div>
              </div>
            </Reveal>
          </section>

          {/* GALLERY — owner photos only; hides itself when empty */}
          {galleryImages.length > 0 && (
            <section className="px-4 pb-20 sm:pb-24">
              <Reveal>
                <SectionHeading
                  eyebrow={ui.galleryEyebrow}
                  title={getDisplayText(data.gallery.heading, ui.galleryTitle)}
                  lang={lang}
                />
              </Reveal>
              <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:gap-4">
                {galleryImages.map((im, i) => (
                  <Reveal key={i} delay={i * 0.06} className={i % 3 === 0 ? "row-span-2" : ""}>
                    <img
                      src={im.src}
                      alt={im.alt || ""}
                      loading="lazy"
                      className="h-full w-full rounded-2xl border border-gold/20 object-cover shadow-[0_12px_34px_rgb(76_27_38_/_0.12)]"
                    />
                  </Reveal>
                ))}
              </div>
            </section>
          )}

          {/* RSVP */}
          {data.rsvp.enabled && (
            <section id="rsvp" className="relative px-4 py-20 sm:py-24">
              <Reveal>
                <SectionHeading
                  title={getDisplayText(data.rsvp.heading, DEF.rsvpTitle)}
                  lang={lang}
                />
                {data.rsvp.subheading && (
                  <p
                    className={`mx-auto mt-5 max-w-md text-center text-[1.02rem] leading-relaxed text-ink/70 ${serifClass(lang)}`}
                  >
                    {data.rsvp.subheading}
                  </p>
                )}
              </Reveal>
              <Reveal delay={0.1} className="mt-10">
                <FloralRomanticRsvp data={data} sansClass={sansClass} />
              </Reveal>
            </section>
          )}

          {/* QUESTIONS — only when the owner filled a contact */}
          {(contactPhone || contactWhatsapp) && (
            <section className="px-4 pb-20">
              <Reveal className="mx-auto max-w-md">
                <div className="rounded-[28px] border border-gold/25 bg-gold-light/20 px-7 py-9 text-center">
                  <p className={`text-2xl text-burgundy ${serifClass(lang)}`}>{ui.questions}</p>
                  <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    {contactPhone && (
                      <a
                        href={`tel:${contactPhone}`}
                        className={`fl-btn inline-flex items-center justify-center gap-2 rounded-xl border border-burgundy/30 px-6 py-3 text-[15px] font-medium text-burgundy hover:bg-burgundy/5 ${sansClass}`}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7a2 2 0 0 1 1.7 2.05Z" />
                        </svg>
                        {ui.call}
                      </a>
                    )}
                    {contactWhatsapp && (
                      <a
                        href={`https://wa.me/${contactWhatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                        className={`fl-btn inline-flex items-center justify-center gap-2 rounded-xl bg-burgundy px-6 py-3 text-[15px] font-medium text-white hover:bg-burgundy-dark ${sansClass}`}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.2c-.23.64-1.33 1.22-1.86 1.27-.5.05-1.12.07-1.8-.11a16 16 0 0 1-1.64-.6c-2.88-1.25-4.76-4.15-4.9-4.34-.15-.2-1.18-1.57-1.18-3s.74-2.12 1-2.4c.27-.3.58-.37.77-.37h.55c.18 0 .42-.06.65.5.23.57.8 1.97.87 2.11.07.15.12.32.02.51-.1.2-.15.31-.29.48-.14.17-.3.38-.43.51-.14.14-.29.3-.12.58.16.29.73 1.2 1.57 1.95 1.08.96 2 1.26 2.28 1.4.28.14.45.12.61-.07.17-.2.7-.82.9-1.1.18-.28.38-.24.64-.14.26.09 1.66.78 1.94.92.29.15.48.22.55.34.06.12.06.66-.17 1.3Z" />
                        </svg>
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </Reveal>
            </section>
          )}

          {/* FOOTER — deep wine, script names, hashtag */}
          <footer
            className="relative overflow-hidden px-4 py-16 text-center"
            style={{
              backgroundImage: `linear-gradient(rgb(61 18 27 / 0.9), rgb(48 13 21 / 0.95)), url(${ASSETS.envelope})`,
              backgroundSize: "cover",
              backgroundPosition: "center bottom",
            }}
          >
            <div className={`leading-tight text-ivory-light ${scriptClass(lang)}`}>
              <p className="text-4xl sm:text-5xl">
                {names.groom}
                <span className={`mx-3 text-3xl text-gold-light ${scriptClass("fr")}`}>&amp;</span>
                {names.bride}
              </p>
            </div>
            {inv.footerMessage && (
              <p className={`mx-auto mt-5 max-w-md text-[1.02rem] leading-relaxed text-ivory-light/75 ${serifClass(lang)}`}>
                {inv.footerMessage}
              </p>
            )}
            {hashtag && (
              /* «And» بخط سكريبتي ذهبي متمايز بين الاسمين */
              <p className={`mt-5 text-sm uppercase tracking-[0.3em] text-gold-light ${sansClass}`} dir="ltr">
                #{hashtag.a}
                <span className="mx-0.5 normal-case tracking-normal text-[1.5em] leading-none text-ivory-light/90 [font-family:var(--font-floral-script)]">
                  And
                </span>
                {hashtag.b}
              </p>
            )}
            <p className={`mt-7 text-[0.7rem] uppercase tracking-[0.25em] text-ivory-light/50 ${sansClass}`}>
              {ui.madeWith} <span className="text-gold-light">♥</span> {ui.forOurDay}
            </p>
            {/* بصمة المنصة — توقيع أنيق */}
            <a
              href="https://www.dawati-dz.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-6 inline-flex flex-col items-center gap-1"
            >
              <span className="flex items-center gap-3 text-gold-light/80 transition-colors group-hover:text-gold-light">
                <span aria-hidden className="h-px w-9 bg-ivory-light/25" />
                <span className="text-[1.6rem] leading-none [font-family:var(--font-floral-script)]">
                  Dawati
                </span>
                <span aria-hidden className="h-px w-9 bg-ivory-light/25" />
              </span>
              <span className={`text-[9px] uppercase tracking-[0.32em] text-ivory-light/40 transition-colors group-hover:text-ivory-light/80 ${sansClass}`}>
                www.dawati-dz.com
              </span>
            </a>
          </footer>
          </div>
        </main>

        {/* template music: Satie's Gymnopédie No.1 (public-domain
            recording) is this template's own default; the moment the
            owner picks music in the dashboard it wins — the base
            config's /music/wedding.mp3 is Islamic Royal chrome and
            must never leak in here */}
        <MusicPlayer
          src={
            data.music && data.music !== "/music/wedding.mp3"
              ? data.music
              : "/assets/templates/floral-romantic/music.mp3"
          }
          openingSrc={
            /* this template's own opening chime: a soft D-major harp
               arpeggio (D–F#–A–D) — the same chord Gymnopédie No.1
               opens on, so it resolves straight into the music. The
               base config's /music/opening.mp3 is Islamic Royal chrome
               and never leaks in; an owner-uploaded sound still wins */
            data.openingSound && data.openingSound !== "/music/opening.mp3"
              ? data.openingSound
              : "/assets/templates/floral-romantic/opening-chime.mp3"
          }
          started={opened}
        />
      </div>
    </div>
  );
}
