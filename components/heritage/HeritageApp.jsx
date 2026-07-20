"use client";

/**
 * Heritage template renderer — sage envelope intro (owner's artwork,
 * untouched) opening onto a soft, romantic, mobile-first invitation page
 * rebuilt on the reference layout:
 *   Hero (cream, script names, doves) → Our Story (gallery) →
 *   Day Program (beige, pink chips) → Event Details (card, map,
 *   Maps/Calendar) → RSVP → Questions → dark-brown Footer.
 *
 * Consumes the same `initialData` (buildAllData output) as Islamic Royal:
 * every wedding field, FR/AR + RTL and the RSVP flow work unchanged.
 * The shared Tailwind color tokens are re-mapped inside `.heritage-root`
 * (so the reused MusicPlayer matches too):
 *   ivory→cream · gold→muted rose · burgundy→rose buttons · ink→dark brown
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  animate,
  AnimatePresence,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";
import { Allura, Great_Vibes, Montserrat, Pinyon_Script } from "next/font/google";
import { getData } from "@/lib/i18n";
import Reveal from "../Reveal";
import MusicPlayer from "../MusicPlayer";
import HeritageRsvp from "./HeritageRsvp";
import { HERITAGE_DEFAULT_GALLERY } from "./galleryConfig";
import { HERITAGE_DEFAULTS, getDisplayText, toFormalName } from "./digitalInviteLuxuryDefaults";

const scriptFont = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heritage-script",
  display: "swap",
});

const sansFont = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-heritage-sans",
  display: "swap",
});

/* formal copperplate — the classic engraved-wax-stamp letterform; used
   ONLY for the seal monogram */
const monogramFont = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heritage-monogram",
  display: "swap",
});

/* luxury handwritten signature — used ONLY for the bride's name line in
   the invitation section (Arabic names fall back to Amiri) */
const brideFont = Allura({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heritage-bride",
  display: "swap",
});

/* palette measured from the reference site's public CSS tokens:
   cream page · COPPER accents · beige chips · dark-olive bands/buttons ·
   near-black warm text */
const HERITAGE_VARS = `
.heritage-root {
  --color-white: 255 255 255;
  --color-ivory: 249 246 235;
  --color-ivory-light: 253 251 245;
  --color-ivory-dark: 240 233 216;
  --color-gold: 211 144 90;
  --color-gold-light: 230 196 162;
  --color-gold-dark: 176 108 56;
  --color-emerald: 74 62 48;
  --color-emerald-light: 122 104 86;
  --color-emerald-dark: 46 38 29;
  --color-ink: 44 36 33;
  --color-burgundy: 61 76 47;
  --color-burgundy-light: 84 102 64;
  --color-burgundy-dark: 46 58 34;
}

/* whisper-soft cream wash + paper grain for the light sections — gradients
   only (no images), far below text-contrast territory */
.heritage-root .h-soft-bg {
  background-image:
    radial-gradient(90% 55% at 50% 0%, rgb(253 251 245 / 0.85), transparent 65%),
    radial-gradient(60% 42% at 10% 100%, rgb(230 196 162 / 0.14), transparent 72%),
    radial-gradient(55% 38% at 92% 88%, rgb(211 144 90 / 0.07), transparent 70%),
    repeating-linear-gradient(115deg, rgb(176 108 56 / 0.015) 0 2px, transparent 2px 7px);
}

/* shared button feel: soft lift on hover, gentle press, smooth everything */
.heritage-root .h-btn {
  transition: transform 0.25s ease, box-shadow 0.25s ease,
    background-color 0.25s ease, border-color 0.25s ease, opacity 0.25s ease;
  box-shadow: 0 2px 10px rgb(44 36 33 / 0.05);
}
.heritage-root .h-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgb(44 36 33 / 0.1);
}
.heritage-root .h-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgb(44 36 33 / 0.08);
}

/* music button (shared MusicPlayer, styled from outside only): light
   glass — frosted cream, hairline bronze border, soft shadow */
.heritage-root .fixed.bottom-4.right-4 {
  background: rgb(253 251 245 / 0.55);
  border-color: rgb(211 144 90 / 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 6px 22px rgb(44 36 33 / 0.12), inset 0 1px 0 rgb(255 255 255 / 0.55);
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
}
.heritage-root .fixed.bottom-4.right-4:hover {
  background: rgb(253 251 245 / 0.75);
  transform: translateY(-1px);
}
.heritage-root .fixed.bottom-4.right-4:active {
  transform: scale(0.96);
}

/* hero CTA arrow: the gentlest of bounces — arrow only, never the text */
@keyframes h-arrow-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(4px); }
}
.heritage-root .h-arrow-bob { animation: h-arrow-bob 2.4s ease-in-out infinite; }

/* floating décor: a slow, barely-there drift (transform only) */
@keyframes h-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-9px) rotate(2.5deg); }
}
.heritage-root .h-float { animation: h-float 8s ease-in-out infinite; }
.heritage-root .h-float-slow { animation: h-float 12s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .heritage-root .h-float,
  .heritage-root .h-float-slow,
  .heritage-root .h-arrow-bob { animation: none; }
}`;

/* template chrome that is not owner-editable, per language */
const UI = {
  fr: {
    open: "Touchez le sceau pour ouvrir",
    /* invitation-line framing (template chrome around the owner's names) */
    fatherPrefix: "Monsieur ",
    fatherSuffix: "",
    motherPrefix: "et son épouse ",
    son: "leur fils",
    daughter: "leur fille",
    programSub: "Ce que nous avons préparé pour vous",
    rsvpCta: "Confirm Attendance",
    galleryEyebrow: "Nos souvenirs",
    galleryTitle: "Notre Galerie",
    gallerySub: "Quelques instants précieux que nous souhaitons partager avec vous",
    joinUs: "Rejoignez-nous",
    beOurGuest: "Soyez notre invité",
    calendar: "Calendrier",
    questions: "Questions ?",
    madeWith: "Fait avec",
    forOurDay: "pour notre jour spécial",
  },
  ar: {
    open: "اضغطوا على الختم للفتح",
    /* invitation-line framing (template chrome around the owner's names) */
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
    joinUs: "انضموا إلينا",
    beOurGuest: "كونوا ضيوفنا",
    calendar: "التقويم",
    questions: "أسئلة؟",
    madeWith: "صُنع بـ",
    forOurDay: "من أجل يومنا المميز",
  },
};

const sansClass = "[font-family:var(--font-heritage-sans)]";
const scriptClass = (lang) =>
  lang === "ar" ? "font-arabicText" : "[font-family:var(--font-heritage-script)]";
/* section titles are serif (Cormorant via --font-body); AR titles use Amiri */
const serifClass = (lang) => (lang === "ar" ? "font-arabicText" : "font-body");

function googleCalendarUrl(data) {
  const iso = data.event.dateTimeISO;
  if (!iso) return "";
  const start = new Date(iso);
  if (Number.isNaN(start.getTime())) return "";
  const end = new Date(start.getTime() + 4 * 3600 * 1000);
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `${data.couple.groomName} & ${data.couple.brideName}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    location: [data.location.venueName, data.location.address].filter(Boolean).join(", "),
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

function hashtagOf(data) {
  const clean = (s) => (s || "").replace(/[^\p{L}\p{N}]/gu, "");
  const year = (data.event.dateTimeISO || "").slice(0, 4);
  // hashtags stay latin: in AR view buildData swaps the couple fields, so
  // groomNameAr/brideNameAr hold the latin names there
  const latin = (main, alt) => (/[A-Za-z]/.test(main || "") ? main : alt || main);
  const a = clean(latin(data.couple.groomName, data.couple.groomNameAr));
  const b = clean(latin(data.couple.brideName, data.couple.brideNameAr));
  if (!a || !b) return "";
  return `#${a}And${b}${year}`;
}

/* ── ♡ ── rose heart divider under the section titles */
function HeartDivider({ className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-gold ${className}`} aria-hidden>
      <span className="h-px w-20 bg-gold/40" />
      <svg width="18" height="16" viewBox="0 0 24 22" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 20 C 4 13, 1 8, 4 4.5 C 6.5 1.8, 10.5 2.6, 12 6 C 13.5 2.6, 17.5 1.8, 20 4.5 C 23 8, 20 13, 12 20 Z" />
      </svg>
      <span className="h-px w-20 bg-gold/40" />
    </div>
  );
}

/* soft bronze section divider — hairline fading at both ends, one tiny
   heart at the center, deliberately understated */
function SectionDivider({ className = "" }) {
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center gap-4 px-10 ${className}`}
    >
      <span
        className="h-px w-full max-w-[9rem]"
        style={{
          background:
            "linear-gradient(to right, transparent, rgb(176 108 56 / 0.35))",
        }}
      />
      <svg
        width="12"
        height="11"
        viewBox="0 0 24 22"
        fill="none"
        stroke="rgb(176 108 56 / 0.45)"
        strokeWidth="2"
      >
        <path d="M12 20 C 4 13, 1 8, 4 4.5 C 6.5 1.8, 10.5 2.6, 12 6 C 13.5 2.6, 17.5 1.8, 20 4.5 C 23 8, 20 13, 12 20 Z" />
      </svg>
      <span
        className="h-px w-full max-w-[9rem]"
        style={{
          background:
            "linear-gradient(to left, transparent, rgb(176 108 56 / 0.35))",
        }}
      />
    </div>
  );
}

/* floating décor: tiny gold leaves in the corners + soft light dots.
   Pure SVG/CSS, absolute, low opacity, pointer-events none — never over
   the text column on phones (anchored to the extreme edges). */
function FloatingDecor({ flip = false }) {
  const leaf = (
    <svg width="52" height="52" viewBox="0 0 48 48" fill="none" strokeLinecap="round">
      <g stroke="rgb(176 108 56 / 0.9)" strokeWidth="1.3">
        <path d="M8 40 Q 20 26, 38 10" />
        <path d="M14 33 q -1 -7 4 -11 q 4 5 -1 11 q -2 1 -3 0Z" />
        <path d="M23 24 q -1 -7 4 -11 q 4 5 -1 11 q -2 1 -3 0Z" />
        <path d="M32 15 q -1 -6 4 -9 q 3 4 -1 9 q -2 1 -3 0Z" />
      </g>
    </svg>
  );
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className={`h-float absolute top-8 opacity-[0.13] ${
          flip ? "-right-2 -scale-x-100" : "-left-2"
        }`}
      >
        {leaf}
      </div>
      <div
        className={`h-float-slow absolute bottom-10 opacity-[0.1] ${
          flip ? "-left-2" : "-right-2 -scale-x-100"
        }`}
      >
        {leaf}
      </div>
      {/* soft light dots */}
      <span
        className={`absolute top-1/4 h-24 w-24 rounded-full bg-gold-light/25 blur-3xl ${
          flip ? "left-[8%]" : "right-[8%]"
        }`}
      />
      <span
        className={`absolute bottom-1/4 h-20 w-20 rounded-full bg-gold/15 blur-3xl ${
          flip ? "right-[10%]" : "left-[10%]"
        }`}
      />
    </div>
  );
}

/* eyebrow (spaced small caps, rose) + big title + heart divider */
function SectionHeading({ eyebrow, title, lang }) {
  return (
    <div className="mb-10 text-center">
      {eyebrow && (
        <p className={`mb-3 text-[0.7rem] font-medium uppercase tracking-[0.35em] text-gold-dark ${sansClass}`}>
          {eyebrow}
        </p>
      )}
      <h2 className={`text-4xl font-medium leading-[1.15] sm:text-5xl ${serifClass(lang)} text-ink`}>
        {title}
      </h2>
      <HeartDivider className="mt-5" />
    </div>
  );
}

/* delicate doves-and-blossoms line ornament (pure SVG — no image files) */
function DovesOrnament({ className = "" }) {
  return (
    <svg
      viewBox="0 0 240 90"
      width="220"
      height="82"
      fill="none"
      aria-hidden
      className={className}
    >
      {/* left dove */}
      <g stroke="#8A6A5C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M96 46c-9-8-24-9-33-2 6 1 9 3 11 6-7 0-12 2-15 6 8-1 14 0 19 3 4 2 10 3 15 1" />
        <path d="M96 46c6-6 6-14 2-20-2 5-5 8-9 9 1-6-1-11-5-14-1 6-3 10-7 13" />
        <path d="M93 60c7 3 15 2 20-2-5-1-8-3-10-6" />
        <circle cx="99" cy="43" r="1.2" fill="#8A6A5C" />
      </g>
      {/* right dove */}
      <g stroke="#8A6A5C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M143 52c9-8 24-9 33-2-6 1-9 3-11 6 7 0 12 2 15 6-8-1-14 0-19 3-4 2-10 3-15 1" />
        <path d="M143 52c-6-6-6-14-2-20 2 5 5 8 9 9-1-6 1-11 5-14 1 6 3 10 7 13" />
        <circle cx="140" cy="49" r="1.2" fill="#8A6A5C" />
      </g>
      {/* blossoms */}
      <g stroke="#C98B52" strokeWidth="1.4" strokeLinecap="round">
        <path d="M118 62c0-5 4-9 4-9s4 4 4 9-4 8-4 8-4-3-4-8Z" />
        <circle cx="122" cy="61" r="1.4" fill="#C98B52" />
        <path d="M62 66q6-6 14-5M178 70q-6-6-14-5" />
        <circle cx="60" cy="67" r="2" />
        <circle cx="180" cy="71" r="2" />
      </g>
      {/* trailing leaves */}
      <g stroke="#A9B48C" strokeWidth="1.3" strokeLinecap="round">
        <path d="M30 72q18-8 40-6M210 76q-18-8-40-6" />
        <path d="M42 68q2-6 8-7M198 72q-2-6-8-7" />
      </g>
    </svg>
  );
}

/* ---------- sealed envelope opening screen (EnvelopeScene) ----------
   Built from the owner's TWO artwork pieces (both 960×1280 on the SAME
   canvas, so one cover-mapping keeps them pixel-aligned — no gaps, no
   white lines, no misalignment):
     bottom-envelope-layer — body with the notch, static forever
     top-envelope-layer    — flap WITH the wax seal baked in; rotates as
                             ONE element (the seal is never separate)
   A dark interior backdrop sits behind both and shows through the
   transparent notch/top once the flap lifts.
   Tap (+150ms press feel): the flap swings OUT toward the viewer then
   up over 3.5s with layered keyframes (rotateX 0→18→65→115→130,
   translateY 0→-40, slight scale), hinged on the artwork's real fold
   line (its top edge, computed from the cover mapping), while the whole
   scene zooms out 1.08→1 in perfect sync and a dynamic shadow breathes
   under the flap. transform/opacity only → 60fps on phones. */
/* الظرف الأصلي (اختيار المستخدم النهائي): قطعتا الرسم الأولي
   بنقش الدانتيل والزخارف الذهبية — نفس الفتح والمدة والظلال الحالية */
/* اختيار المستخدم (النقطة 7): ظرف Higgsfield المتناظر المريمي —
   درزاه من (0,51) و(960,49) إلى الرأس (480,733)، الغطاء مثلث صرف
   والختم يركب معه عبر القرص العائم، والجيب صورة الظرف المفتوح
   المولّدة كاملة */
const ENVELOPE_TOP = "/assets/templates/heritage2-top.png";
const ENVELOPE_BOTTOM = "/assets/templates/heritage2-bottom.png";
const IMG_W = 960;
const IMG_H = 1280; // intrinsic size of both artwork pieces
const EASE = [0.22, 1, 0.36, 1];
const OPEN_DELAY = 0.15; // the press "lands" before the flap starts moving
/* أبطأ قليلًا من إيقاع Islamic Royal: الغطاء ينطوي في 2.6 ثانية
   والظرف يختفي عند ~2.15 ثانية من النقرة */
const OPEN_DURATION = 2.6;

/* where the artwork lands in the viewport (bg-cover bg-center): the flap's
   real fold line is the artwork's top edge — hingeY is that line in px.
   cavityClip traces the opening (measured from the pocket PNG's alpha). */
function useEnvelopeScene() {
  const [scene, setScene] = useState(null);
  useEffect(() => {
    let retry;
    function compute() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // hidden/zero-sized viewport (background tab): retry until it's real,
      // otherwise the hinge would be computed at 0,0
      if (!vw || !vh) {
        retry = setTimeout(compute, 200);
        return;
      }
      const scale = Math.max(vw / IMG_W, vh / IMG_H);
      const w = IMG_W * scale;
      const h = IMG_H * scale;
      const ox = (vw - w) / 2;
      const oy = (vh - h) / 2;
      const P = (x, y, dy = 0) =>
        `${(ox + x * w).toFixed(1)}px ${(oy + y * h + dy).toFixed(1)}px`;
      /* the opening's edge path: left diagonal → curved notch → right
         diagonal. MEASURED from the pocket PNG's alpha channel (column
         scan), so it hugs the real artwork edge exactly */
      const EDGE = [
        [0, 0.0398],
        [0.25, 0.3062],
        [0.5, 0.5727],
        [0.75, 0.3055],
        [1, 0.0383],
      ];
      /* opening mouth: follows the edge path (+3px overlap) */
      const cavityClip = `polygon(${[
        P(0, 0),
        P(1, 0),
        ...[...EDGE].reverse().map(([x, y]) => P(x, y, 3)),
      ].join(", ")})`;
      setScene({
        hingeY: oy,
        cavityClip,
        /* bottom of the pocket's notch — anchors the cavity's contact
           shadow (strongest at center, lighter at the sides) */
        notchY: oy + 0.5727 * h,
        /* camera close-up anchor — tuned so the sealed frame shows the
           FULL Arabic welcome (with its ornaments) at the top, the seal
           large at mid-frame and the Welcome script complete below */
        closeupY: oy + 0.5 * h,
        /* wax seal: a standalone overlay (heritage2-seal.png, the disc on
           a sub-pixel-centered square canvas) inside a flex-centered
           positioner, drawn exactly over the baked disc — centering
           never depends on the artwork file. Row and radius are the
           PNG measurements (canvas 270px, disc center 480,640). */
        sealY: oy + 0.5 * h, // disc center row (640/1280)
        sealD: (270 / 960) * w, // overlay canvas at artwork scale
      });
    }
    compute();
    window.addEventListener("resize", compute);
    return () => {
      clearTimeout(retry);
      window.removeEventListener("resize", compute);
    };
  }, []);
  return scene;
}

function HeritageIntro({ ui, opened, onOpen, onGone, initials }) {
  const scene = useEnvelopeScene();
  const reduceMotion = useReducedMotion();

  /* openProgress — the single source of truth (0 = sealed, 1 = open).
     Rotation, zoom, cavity, every shadow, brightness and the edge light
     all derive from it, so the lighting follows the flap angle
     continuously instead of running on separate clocks. */
  const progress = useMotionValue(0);
  useEffect(() => {
    const controls = animate(progress, opened ? 1 : 0, {
      duration: opened ? OPEN_DURATION : 0.5,
      delay: opened ? OPEN_DELAY : 0,
      ease: "easeInOut",
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  /* flap motion — same keyframes, speed and direction as before */
  const rotateX = useTransform(progress, [0, 0.25, 0.5, 0.78, 1], [0, 18, 65, 115, 130]);
  const flapY = useTransform(progress, [0, 0.25, 0.5, 0.78, 1], [0, -4, -15, -30, -40]);
  const flapScale = useTransform(progress, [0, 0.5, 1], [1, 1.01, 1.015]);
  /* camera: sealed = an intimate close-up on the wax seal (reference
     video framing — the texture fills the screen, the script line sits
     right under the seal); opening pulls back to reveal the whole
     envelope. Same MotionValue → perfectly synchronous. */
  const zoom = useTransform(progress, [0, 1], [1.2, 1]);
  /* ظل الغطاء الحي فوق الجيب: يغطي الفم في بداية الرفع ثم يتقلص
     صاعدًا نحو المفصل ويخف كلما ارتفع الغطاء — كظل ورقة حقيقية */
  const castOpacity = useTransform(progress, [0, 0.22, 0.7, 1], [0, 0.5, 0.24, 0.06]);
  const castScaleY = useTransform(progress, [0, 1], [1, 0.22]);
  /* the big soft shadow at the top of the mouth — grows with the lift
     and settles, staying after the flap is open */
  const foldOpacity = useTransform(progress, [0, 0.25, 0.6], [0, 0.4, 0.65]);
  /* flap tone: matched to the pocket paper — settles on
     brightness(0.96) saturate(0.88) contrast(1.02), no jump while closed */
  const brightness = useTransform(progress, [0, 0.5, 1], [1, 0.9, 0.96]);
  const saturate = useTransform(progress, [0, 1], [1, 0.88]);
  const contrast = useTransform(progress, [0, 1], [1, 1.02]);
  const faceFilter = useMotionTemplate`brightness(${brightness}) saturate(${saturate}) contrast(${contrast})`;

  const layerImg = (src) => ({
    backgroundImage: `url(${src})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  });
  return (
    <motion.button
      type="button"
      /* guard: one tap only — ignore repeats while opening/transitioning */
      onClick={() => {
        if (!opened) onOpen();
      }}
      initial={false}
      /* pure crossfade on a FIXED clock from the tap: the envelope fades
         out between t=1300ms and t=2150ms — NO zoom, NO scale, NO camera
         push, NO blur, the envelope never moves. With
         prefers-reduced-motion: a short immediate fade instead. */
      animate={opened ? { opacity: 0 } : { opacity: 1 }}
      transition={{
        duration: reduceMotion ? 0.4 : 0.85,
        delay: opened ? (reduceMotion ? 0 : 1.3) : 0,
        ease: "easeInOut",
      }}
      onAnimationComplete={() => {
        if (opened) onGone();
      }}
      aria-label={ui.open}
      className={`fixed inset-0 z-[60] block w-full overflow-hidden outline-none ${
        opened ? "pointer-events-none" : ""
      }`}
    >
      {/* EnvelopeScene camera — the ONLY perspective in the scene; zoom is
          driven by openProgress so it can never drift out of sync. The
          close-up is anchored on the seal's center. */}
      <motion.div
        className="absolute inset-0"
        style={{
          scale: zoom,
          perspective: 1400,
          transformOrigin: scene ? `50% ${scene.closeupY}px` : "50% 57%",
        }}
      >
        {/* background — deep base behind everything */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(#2A3315, #3A4522 55%, #2E3818)" }}
        />

        {/* envelope-inner-background — a REAL opaque back wall inside the
            pocket, pure CSS. It sits BELOW the pocket image, whose real
            alpha hole reveals it, so the opening shape is pixel-exact and
            never a rectangle. Deep gradual darkness from the top, paper
            grain, soft center light — the slanted edges read purely
            through the light difference (no rim, no border). */}
        {scene && (
          <div
            aria-hidden
            className="envelope-inner-background pointer-events-none absolute inset-0"
            style={{
              clipPath: scene.cavityClip,
              background: [
                /* ambient occlusion under the opening's inner edge */
                `radial-gradient(46% 80px at 50% ${scene.notchY.toFixed(0)}px, rgba(8, 14, 5, 0.5), transparent 72%)`,
                /* deep gradual darkness from the top of the mouth */
                "linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.45) 18%, rgba(0, 0, 0, 0.18) 38%, rgba(0, 0, 0, 0) 70%)",
                /* faint paper grain so the middle never reads flat */
                "repeating-linear-gradient(112deg, rgba(255, 255, 255, 0.025) 0 1.5px, transparent 1.5px 5px)",
                "repeating-linear-gradient(24deg, rgba(0, 0, 0, 0.03) 0 1px, transparent 1px 7px)",
                /* soft light in the middle of the cavity */
                "radial-gradient(ellipse at 50% 35%, rgba(116, 132, 72, 0.3) 0%, rgba(60, 75, 34, 0.14) 45%, rgba(24, 33, 13, 0.42) 100%)",
                /* opaque paper base — deep olive, matched to the artwork */
                "linear-gradient(180deg, #37451F 0%, #48582A 45%, #26311A 100%)",
              ].join(", "),
            }}
          />
        )}

        {/* front-envelope-pocket — static forever (fully opaque artwork:
            the AI open-envelope render, mouth interior painted in) */}
        <div aria-hidden className="absolute inset-0" style={layerImg(ENVELOPE_BOTTOM)} />

        {/* envelope-flap-shadow — الظل الذي يلقيه الغطاء على الجيب،
            فوق الجيب ومقصوص على شكل الفم: يغطيه عند بدء الرفع ثم
            يتقلص نحو المفصل ويخف مع ارتفاع الغطاء */}
        {scene && (
          <motion.div
            aria-hidden
            className="envelope-flap-shadow pointer-events-none absolute inset-0"
            style={{
              clipPath: scene.cavityClip,
              opacity: castOpacity,
              scaleY: castScaleY,
              transformOrigin: "50% 0%",
              filter: "blur(14px)",
              willChange: "transform, opacity",
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 55%, rgba(0,0,0,0) 95%)",
            }}
          />
        )}

        {/* envelope-fold-shadow — عتمة مستقرة أعلى الفم بعد الانفتاح */}
        {scene && (
          <motion.div
            aria-hidden
            className="envelope-fold-shadow pointer-events-none absolute inset-0"
            style={{
              clipPath: scene.cavityClip,
              opacity: foldOpacity,
              filter: "blur(20px)",
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.22) 30%, rgba(0,0,0,0) 60%)",
            }}
          />
        )}

        {/* top-envelope-layer — flap + seal as ONE element, hinged on the
            artwork's real fold line; opens toward the viewer, then up */}
        {scene && (
          <motion.div
            aria-hidden
            className="absolute inset-0"
            style={{
              rotateX,
              y: flapY,
              scale: flapScale,
              transformOrigin: `50% ${scene.hingeY}px`,
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
              willChange: "transform",
            }}
          >
            {/* front: the artwork piece (seal baked in) — self shadow via
                brightness/contrast that follows the rotation angle.
                Kept a plain leaf node: an animated filter re-rasterizes
                its subtree every frame, so nothing may live inside it. */}
            <motion.div
              className="absolute inset-0"
              style={{
                ...layerImg(ENVELOPE_TOP),
                backfaceVisibility: "hidden",
                filter: faceFilter,
              }}
            />

            {/* wax seal — rides the flap (baked disc in the flap piece
                sits directly behind this overlay):
                  wax-seal-positioner ← centering ONLY
                    └── wax-seal-animator ← seal-sized surface, carries
                        the face filter so it dims with the flap
                        ├── heritage2-seal.png (sub-pixel-centered disc)
                        └── dynamic monogram (flex-centered) */}
              {scene && (
                <div
                  aria-hidden
                  className="wax-seal-positioner pointer-events-none absolute left-0 right-0 flex items-center justify-center"
                  style={{
                    top: scene.sealY - scene.sealD / 2,
                    height: scene.sealD,
                    backfaceVisibility: "hidden",
                  }}
                >
                  <motion.div
                    className="wax-seal-animator relative flex items-center justify-center"
                    style={{
                      width: scene.sealD,
                      height: scene.sealD,
                      filter: faceFilter,
                      backfaceVisibility: "hidden",
                      transform: "translateZ(0)",
                      willChange: "filter",
                    }}
                  >
                    <img
                      src="/assets/templates/heritage2-seal.png"
                      alt=""
                      draggable={false}
                      className="absolute inset-0 h-full w-full"
                    />
                    {initials && (
                      <div
                        dir="ltr"
                        className="relative"
                        style={{
                          /* the visible disc fills 332/344 of the canvas */
                          width: (scene.sealD * 332) / 344,
                          height: (scene.sealD * 332) / 344,
                        }}
                      >
                  <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ display: "block" }}>
                    {(() => {
                      /* الفكرة 3 وحدها: نقش شمع بعمق قالب حقيقي — لا ذهب
                         ولا تشابك. الوجه بلون الشمع الفاتح قليلًا، احتكاك
                         غائر حاد تحت الضربات، ضوء علوي دافئ أوضح، وأخدود
                         هضبة دائري محفور حول الحروف كأثر قالب نحاسي */
                      const FACE = "rgb(156, 80, 56)"; // wax, one breath lighter
                      const LIGHT = "rgba(255, 208, 176, 0.5)";
                      const SHADOW = "rgba(26, 6, 2, 0.62)";
                      const AMBIENT = "rgba(30, 7, 3, 0.35)";
                      const cipher = (fill) => (
                        <g fill={fill}>
                          <text x="88" y="121" textAnchor="middle" fontSize="86">{initials.a}</text>
                          <text x="66" y="134" textAnchor="middle" fontSize="30">&amp;</text>
                          <text x="119" y="149" textAnchor="middle" fontSize="80">{initials.b}</text>
                        </g>
                      );
                      const ring = (stroke) => (
                        <circle cx="100" cy="101" r="57" fill="none" stroke={stroke} strokeWidth="1.5" />
                      );
                      return (
                        <g fontFamily="var(--font-body), 'Cormorant Garamond', 'Amiri', serif" fontWeight="600">
                          <defs>
                            <filter id="h-mono-soft" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur stdDeviation="2" />
                            </filter>
                          </defs>
                          {/* أخدود الهضبة المحفور (عكس البروز: ظل أعلى، ضوء
                              أسفل، قاع أغمق) — أثر حافة القالب النحاسي */}
                          <g fill="none">
                            <circle cx="100" cy="99.4" r="70" stroke="rgba(26, 6, 2, 0.5)" strokeWidth="2" />
                            <circle cx="100" cy="102" r="70" stroke="rgba(255, 208, 176, 0.4)" strokeWidth="1.3" />
                            <circle cx="100" cy="100.6" r="70" stroke="rgba(118, 52, 34, 0.85)" strokeWidth="1.1" />
                          </g>
                          {/* grounding blur so the relief sits DEEP in the wax */}
                          <g transform="translate(0 4)" filter="url(#h-mono-soft)">
                            {ring(AMBIENT)}
                            {cipher(AMBIENT)}
                          </g>
                          {/* raised relief: deeper occlusion below, crisper
                              warm light above, face */}
                          <g transform="translate(0 2.6)">{ring(SHADOW)}{cipher(SHADOW)}</g>
                          <g transform="translate(0 -1.8)">{ring(LIGHT)}{cipher(LIGHT)}</g>
                          {ring(FACE)}
                          {cipher(FACE)}
                        </g>
                      );
                    })()}
                  </svg>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}
          </motion.div>
        )}
      </motion.div>

      <motion.p
        initial={false}
        animate={opened ? { opacity: 0 } : { opacity: [0.55, 1, 0.55] }}
        transition={
          opened
            ? { duration: 0.2 }
            : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
        }
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#31391D]/45 px-5 py-2 text-[0.65rem] uppercase tracking-[0.35em] text-[#F0DFB6] backdrop-blur-sm ${sansClass}`}
      >
        {ui.open}
      </motion.p>
    </motion.button>
  );
}

/* ---------- editorial gallery + lightbox (framer-motion only, no library) ----------
   Shows the owner's photos (media.gallery, up to 8) or the template's own
   default set (galleryConfig.js) when the owner added none. The base
   config's demo shots under /assets/gallery/ are Islamic Royal design
   assets, not owner content — they never appear here.

   Editorial rhythm instead of a flat grid: one full-width opening photo,
   then the rest in a tight two-column grid; a trailing orphan widens to
   a full row, so any count from 1 to 8 composes cleanly. */
function galleryRowSpans(n) {
  return Array.from({ length: n }, (_, i) =>
    i === 0 || (i === n - 1 && (n - 1) % 2 === 1) ? 2 : 1
  );
}

function HeritageGallery({ images }) {
  const [lightbox, setLightbox] = useState(null); // photo index or null
  const touchX = useRef(null);
  const spans = galleryRowSpans(images.length);

  const step = (dir) =>
    setLightbox((i) => (i === null ? i : (i + dir + images.length) % images.length));

  /* lightbox open: lock the page scroll; Escape closes, arrows navigate */
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox === null]);

  const navBtn =
    "flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20";

  return (
    <>
      <div className="mx-auto grid max-w-md grid-cols-2 gap-2.5 sm:gap-3">
        {images.map((img, i) => (
          <Reveal
            key={img.src}
            delay={i * 0.08}
            y={20}
            className={spans[i] === 2 ? "col-span-2" : ""}
          >
            <button
              type="button"
              onClick={() => setLightbox(i)}
              aria-label={img.alt || `Photo ${i + 1}`}
              className="h-btn block w-full overflow-hidden rounded-[18px] shadow-[0_10px_30px_rgb(64_47_32_/_0.08)]"
            >
              {/* fixed aspect boxes → zero layout shift while photos load */}
              <img
                src={img.src}
                alt={img.alt || ""}
                loading="lazy"
                decoding="async"
                sizes={spans[i] === 2 ? "(max-width: 512px) 92vw, 448px" : "(max-width: 512px) 46vw, 220px"}
                className={`w-full object-cover object-center ${
                  spans[i] === 2 ? "aspect-[16/10]" : "aspect-[4/5]"
                }`}
              />
            </button>
          </Reveal>
        ))}
      </div>

      <AnimatePresence>
        {lightbox !== null && images[lightbox] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            onClick={() => setLightbox(null)}
            onTouchStart={(e) => {
              touchX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              touchX.current = null;
              if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1);
            }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-[#1F1B16]/88 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            {/* keyed on the index: photo changes crossfade softly */}
            <motion.img
              key={lightbox}
              src={images[lightbox].src}
              alt={images[lightbox].alt || ""}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-full rounded-[22px] object-contain shadow-[0_30px_80px_rgb(0_0_0_/_0.45)]"
            />

            <button
              type="button"
              onClick={() => setLightbox(null)}
              aria-label="Fermer"
              className={`absolute right-4 top-4 ${navBtn}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                  aria-label="Précédente"
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${navBtn}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="m15 5-7 7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                  aria-label="Suivante"
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${navBtn}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="m9 5 7 7-7 7" />
                  </svg>
                </button>
                <p
                  aria-hidden
                  className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3.5 py-1 text-xs tracking-[0.2em] text-white/85 backdrop-blur-md [font-family:var(--font-heritage-sans)]"
                >
                  {lightbox + 1} / {images.length}
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------- hero video with a full fallback chain ----------
   owner's video → (load error) template default video → (that fails
   too, or the device refuses playback) the template poster image.
   The hero section itself never disappears: the cream gradients behind
   it always render, and the poster attribute covers devices that block
   autoplay (e.g. iPhone low-power mode). Muted/inline/looped — sound is
   never relied on. */
function HeroVideo({ src }) {
  // 0 = play the given src · 1 = play the template default · 2 = poster
  const [stage, setStage] = useState(0);
  useEffect(() => setStage(src === HERITAGE_DEFAULTS.heroVideo ? 1 : 0), [src]);

  if (stage === 2) {
    return (
      <img
        src={HERITAGE_DEFAULTS.heroPoster}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: "brightness(1.12) saturate(0.78) contrast(0.9)" }}
      />
    );
  }
  const activeSrc = stage === 0 ? src : HERITAGE_DEFAULTS.heroVideo;
  return (
    <video
      key={activeSrc}
      src={activeSrc}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={HERITAGE_DEFAULTS.heroPoster}
      onError={() => setStage(stage === 0 ? 1 : 2)}
      className="absolute inset-0 h-full w-full object-cover"
      style={{ filter: "brightness(1.12) saturate(0.78) contrast(0.9)" }}
    />
  );
}

/* ---------- minimal countdown row for the cream hero ---------- */
function HeritageCountdown({ data }) {
  // `now` stays null during SSR/hydration so server and client render the
  // same "--" placeholders; the real digits appear on the first client tick.
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = new Date(data.event.dateTimeISO).getTime();
  if (!target || Number.isNaN(target)) return null;
  const diff = now === null ? null : Math.max(0, target - now);
  if (diff === 0) {
    return (
      <p className="mt-10 text-center font-body text-xl italic text-gold-dark">
        {data.countdown.expiredText}
      </p>
    );
  }
  const units =
    diff === null
      ? [["days", null], ["hours", null], ["minutes", null], ["seconds", null]]
      : [
          ["days", Math.floor(diff / 86400000)],
          ["hours", Math.floor(diff / 3600000) % 24],
          ["minutes", Math.floor(diff / 60000) % 60],
          ["seconds", Math.floor(diff / 1000) % 60],
        ];
  return (
    /* Premium glass card — frosted panel with one small tile per unit,
       so the digits never sit raw on the footage */
    <div
      className="mx-auto mt-10 w-full rounded-[22px]"
      style={{
        maxWidth: "min(88%, 26rem)",
        padding: "14px 16px",
        background: "rgba(255, 255, 255, 0.28)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.35)",
        boxShadow: "0 12px 35px rgba(0, 0, 0, 0.12)",
      }}
    >
      <div className="flex items-stretch justify-center" style={{ gap: "10px" }}>
        {units.map(([key, value]) => (
          <div key={key} className="min-w-0 flex-1 rounded-2xl bg-white/25 px-0.5 py-2 text-center">
            <p
              className="font-body font-medium"
              style={{ color: "#2F2A24", fontSize: "clamp(28px, 7.6vw, 34px)", lineHeight: 1.15 }}
            >
              {value === null ? "--" : String(value).padStart(2, "0")}
            </p>
            <p
              className={`mt-1 uppercase ${sansClass}`}
              style={{ color: "#B88A5A", fontSize: "10px", letterSpacing: "0.01em" }}
            >
              {data.countdown.labels[key]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* day-program icons, cycled by row (guests, rings, glass, dinner, music) */
const PROGRAM_ICONS = [
  <path key="g" d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 20c0-3.5 3-6 7-6s7 2.5 7 6M15 15.5c2.8.3 5 2.1 5 4.5" />,
  <path key="h" d="M12 20 C 5 14, 2 9.5, 4.8 6.2 C 7 3.6, 10.6 4.4, 12 7.4 C 13.4 4.4, 17 3.6, 19.2 6.2 C 22 9.5, 19 14, 12 20 Z" />,
  <path key="c" d="M8 3h8l-1 7a3.5 3.5 0 0 1-6 0L8 3Zm4 10v7m-4 0h8" />,
  <path key="d" d="M5 3v8m3-8v8M6.5 3v18M6.5 11H5a1.5 1.5 0 0 1 0 0m12-8c-1.7 0-3 2-3 5s1.3 5 3 5v8m0-18c1.7 0 3 2 3 5" />,
  <path key="m" d="M9 18V6l10-2v11.5M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm10-2.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />,
];

/* محطة برنامج حية: تشتعل عند وصول تقدم التمرير إليها — الأيقونة
   تمتلئ ذهبًا وتتوهج، والنص يرتفع قليلًا ويكتمل وضوحه */
function ProgramStation({ item, icon, last, progress, center, lang, iconRef }) {
  const t = useTransform(progress, [center - 0.09, center + 0.02], [0, 1]);
  const iconBg = useTransform(t, [0, 1], ["rgba(230, 213, 166, 0)", "rgba(230, 213, 166, 1)"]);
  const iconColor = useTransform(t, [0, 1], ["#E8D9B2", "#3F4C2F"]);
  const iconShadow = useTransform(
    t,
    [0, 1],
    ["0 0 0px rgba(230, 213, 166, 0)", "0 0 20px rgba(230, 213, 166, 0.55)"]
  );
  const lift = useTransform(t, [0, 1], [0, -3]);
  const rowOpacity = useTransform(t, [0, 1], [0.72, 1]);
  return (
    <li className="relative flex gap-5 pb-9 last:pb-0">
      <div className="flex flex-col items-center">
        <motion.span
          ref={iconRef}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D9CBA4]/60"
          style={{ backgroundColor: iconBg, color: iconColor, boxShadow: iconShadow }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            {icon}
          </svg>
        </motion.span>
        {!last && <span className="mt-2 w-px flex-1 bg-[#D9CBA4]/35" />}
      </div>
      <motion.div className="pt-1" style={{ y: lift, opacity: rowOpacity }}>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-md bg-gold-light px-2.5 py-1 text-xs font-semibold text-[#3F4C2F] ${sansClass}`}
          >
            {item.time}
          </span>
          <span className={`text-xl text-[#F5EBD5] ${serifClass(lang)}`}>{item.title}</span>
        </div>
        {item.description && (
          <p className={`mt-2 text-sm leading-relaxed text-[#E2D8BE]/85 ${sansClass}`}>
            {item.description}
          </p>
        )}
      </motion.div>
    </li>
  );
}

/* مسار البرنامج المتحرك: خط ذهبي يمتلئ مع التمرير ونقطة متوهجة
   تسافر بين المحطات نزولًا وصعودًا (تقدم زنبركي ناعم) */
function ProgramTimeline({ program, lang }) {
  const listRef = useRef(null);
  const iconRefs = useRef([]);
  const [geo, setGeo] = useState(null); // {x, top, height, fracs[]}
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start 72%", "end 42%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 70, damping: 22, mass: 0.4 });
  const dotTop = useTransform(progress, (v) => (geo ? geo.top + v * geo.height : 0));

  useEffect(() => {
    const measure = () => {
      const c = listRef.current;
      if (!c || !c.offsetHeight) return;
      const centers = iconRefs.current.slice(0, program.length).map((el) => {
        if (!el) return null;
        let top = 0;
        let left = 0;
        let n = el;
        while (n && n !== c) {
          top += n.offsetTop;
          left += n.offsetLeft;
          n = n.offsetParent;
        }
        return { y: top + el.offsetHeight / 2, x: left + el.offsetWidth / 2 };
      });
      if (centers.some((p) => !p) || centers.length < 2) return;
      const top = centers[0].y;
      const bottom = centers[centers.length - 1].y;
      setGeo({
        x: centers[0].x,
        top,
        height: bottom - top,
        fracs: centers.map((p) => (p.y - top) / (bottom - top)),
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [program.length]);

  return (
    <ol ref={listRef} className="relative mx-auto max-w-md">
      {geo && (
        <>
          {/* الخط الذهبي الممتلئ فوق المسار الباهت */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              left: geo.x - 1,
              top: geo.top,
              height: geo.height,
              width: 2,
              transformOrigin: "top",
              scaleY: progress,
              background:
                "linear-gradient(180deg, rgba(230, 213, 166, 0.95), rgba(230, 213, 166, 0.5))",
            }}
          />
          {/* النقطة المتوهجة المسافرة */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute z-10"
            style={{ left: geo.x, top: dotTop, x: "-50%", y: "-50%" }}
          >
            <span
              style={{
                display: "block",
                width: 10,
                height: 10,
                borderRadius: 999,
                background: "#F2E7CE",
                boxShadow:
                  "0 0 12px rgba(242, 231, 206, 0.9), 0 0 28px rgba(230, 213, 166, 0.5)",
              }}
            />
          </motion.div>
        </>
      )}
      {program.map((item, i) => (
        <Reveal key={`${item.time}-${item.title}`} delay={i * 0.08}>
          <ProgramStation
            item={item}
            icon={PROGRAM_ICONS[i % PROGRAM_ICONS.length]}
            last={i === program.length - 1}
            progress={progress}
            center={geo ? geo.fracs[i] : (i + 0.5) / program.length}
            lang={lang}
            iconRef={(el) => (iconRefs.current[i] = el)}
          />
        </Reveal>
      ))}
    </ol>
  );
}

/* ---------- the page ---------- */
export default function HeritageApp({ weddingIdOverride, initialData }) {
  const [opened, setOpened] = useState(false);
  const [introGone, setIntroGone] = useState(false);

  const defaultLang = initialData?.fr?.defaultLang || "fr";
  const enabledLangs = initialData?.fr?.enabledLangs || ["fr", "ar"];
  const [lang, setLang] = useState(defaultLang);
  const [textFading, setTextFading] = useState(false);

  const data = useMemo(() => {
    const base = initialData ? initialData[lang] || initialData.fr : getData(lang);
    return weddingIdOverride
      ? { ...base, rsvp: { ...base.rsvp, weddingId: weddingIdOverride } }
      : base;
  }, [lang, weddingIdOverride, initialData]);

  const ui = UI[lang] || UI.fr;
  /* template display defaults for the current language (never persisted) */
  const DEF = HERITAGE_DEFAULTS[lang] || HERITAGE_DEFAULTS.fr;
  const calendarUrl = useMemo(() => googleCalendarUrl(data), [data]);
  const hashtag = useMemo(() => hashtagOf(data), [data]);
  /* wax-seal monogram: first letter of each name. Latin names preferred
     (stable across FR/AR views — buildData swaps the couple fields in AR,
     so the *Ar keys hold the latin spellings there); falls back to the
     Arabic letters when no latin name exists. */
  const sealInitials = useMemo(() => {
    const latin = (main, alt) => (/[A-Za-z]/.test(main || "") ? main : alt || main || "");
    const a = latin(data.couple.groomName, data.couple.groomNameAr).trim();
    const b = latin(data.couple.brideName, data.couple.brideNameAr).trim();
    if (!a || !b) return null;
    return { a: a[0].toUpperCase(), b: b[0].toUpperCase() };
  }, [data]);
  const reduceMotion = useReducedMotion();

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
    document.body.style.overflow = opened ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
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
  /* owner photos when they exist, else the template's own default set;
     the base config's /assets/gallery/ demo shots are Islamic Royal
     chrome and must never leak into Heritage */
  const galleryImages = useMemo(() => {
    const owner = (data.gallery?.images || []).filter(
      (im) => im?.src && !im.src.startsWith("/assets/gallery/")
    );
    return (owner.length ? owner : HERITAGE_DEFAULT_GALLERY).slice(0, 8);
  }, [data]);
  /* Wedding Invitation section: the owner's words for this language,
     each line falling back to the template default when left empty.
     Personal fields (names, footer message) get NO invented default —
     they simply hide; date/time/venue fall back to the real values the
     owner already saved in the standard dashboard fields. */
  const invSaved = data.invitation || {};
  const inv = {
    honoreeGender:
      invSaved.honoreeGender === "male" || invSaved.honoreeGender === "female"
        ? invSaved.honoreeGender
        : "",
    basmala: getDisplayText(invSaved.basmala, HERITAGE_DEFAULTS.basmala),
    /* parents' names in formal casing (Abdelaziz Jefal) however the
       owner typed them; Arabic passes through unchanged */
    fatherName: toFormalName(getDisplayText(invSaved.fatherName)),
    motherName: toFormalName(getDisplayText(invSaved.motherName)),
    invitationText: getDisplayText(invSaved.invitationText, DEF.invitationText),
    mainTitle: getDisplayText(invSaved.mainTitle, lang === "ar" ? DEF.invitationTitle : ""),
    brideName: getDisplayText(invSaved.brideName),
    dateIntro: getDisplayText(invSaved.dateIntro, DEF.dateIntro),
    weddingDate: getDisplayText(invSaved.weddingDate, data.event.displayDate),
    time: getDisplayText(invSaved.time, data.event.displayTime),
    hallIntro: getDisplayText(invSaved.hallIntro, DEF.hallIntro),
    hallName: getDisplayText(invSaved.hallName, data.location.venueName || ""),
    footerMessage: getDisplayText(invSaved.footerMessage),
  };
  const invFont = lang === "ar" ? "font-arabicText" : "font-body";
  const invItalic = lang === "ar" ? "" : "italic";

  return (
    <div className={`heritage-root ${scriptFont.variable} ${sansFont.variable} ${monogramFont.variable} ${brideFont.variable}`}>
      <style dangerouslySetInnerHTML={{ __html: HERITAGE_VARS }} />

      {/* language pill (🌐 FR / AR) */}
      {enabledLangs.length > 1 && (
        <button
          type="button"
          onClick={switchLang}
          className={`h-btn fixed right-4 top-4 z-[70] flex items-center gap-1.5 rounded-full border border-gold/40 bg-ivory-light/60 px-4 py-1.5 text-sm text-ink/80 shadow-[0_6px_22px_rgb(44_36_33_/_0.12)] backdrop-blur-md hover:bg-ivory-light/80 ${
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
        {!introGone && (
          <>
            <HeritageIntro
              ui={ui}
              opened={opened}
              onOpen={() => setOpened(true)}
              onGone={() => setIntroGone(true)}
              initials={sealInitials}
            />
            {/* transition-overlay — a whisper of olive (max 0.12) that
                bridges the color difference while the two pages crossfade,
                then dissolves. Above both scenes, never interactive. */}
            <motion.div
              aria-hidden
              className="pointer-events-none fixed inset-0 z-[65]"
              initial={false}
              animate={opened ? { opacity: [0, 0.12, 0] } : { opacity: 0 }}
              transition={{
                duration: reduceMotion ? 0.4 : 0.85,
                delay: opened ? (reduceMotion ? 0 : 1.3) : 0,
                times: [0, 0.5, 1],
                ease: "easeInOut",
              }}
              style={{ background: "#232B12" }}
            />
          </>
        )}

        <main className="bg-ivory text-ink">
          {/* 2 — HERO: soft cream, small eyebrow, script names, ornament,
              airy middle with the countdown, doves at the bottom */}
          <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
            {/* crossfade entrance: the page is mounted behind the envelope
                from the start and simply fades in (opacity only — no zoom,
                no scale) between t=1300ms and t=2150ms, exactly while the
                envelope fades out */}
            <motion.div
              aria-hidden
              className="absolute inset-0"
              initial={false}
              animate={opened ? { opacity: 1 } : { opacity: 0 }}
              transition={{
                duration: reduceMotion ? 0.5 : 0.85,
                delay: opened ? (reduceMotion ? 0.15 : 1.3) : 0,
                ease: "easeInOut",
              }}
              style={{
                background:
                  "radial-gradient(120% 60% at 50% 0%, rgb(253 251 245 / 0.9), transparent 60%)," +
                  "radial-gradient(90% 40% at 50% 100%, rgb(230 196 162 / 0.3), transparent 70%)",
              }}
            >
              {/* hero VIDEO — ALWAYS present: the owner's footage when
                  set, else the template's own default; HeroVideo handles
                  broken sources and playback-refusing devices (poster).
                  Shown at full clarity with the editorial color grade;
                  a hair-light gradient at the very bottom eases into the
                  next section */}
              {(
                <>
                  <HeroVideo
                    src={getDisplayText(data.assets.heroVideo, HERITAGE_DEFAULTS.heroVideo)}
                  />
                  {/* warm soft-light wash — lifts shadows, keeps Morocco warm */}
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background: "rgba(255, 244, 224, 0.5)",
                      mixBlendMode: "soft-light",
                    }}
                  />
                  {/* readability gradients: a light pocket behind the names
                      and a whisper at the countdown — the middle stays clear */}
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(85% 26% at 50% 24%, rgba(255, 249, 238, 0.4), transparent 72%)," +
                        "radial-gradient(70% 14% at 50% 55%, rgba(255, 248, 236, 0.28), transparent 78%)",
                    }}
                  />
                  <div
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-20"
                    style={{
                      background:
                        "linear-gradient(transparent, rgb(249 246 235 / 0.9))",
                    }}
                  />
                </>
              )}
            </motion.div>
            <div className="relative flex w-full flex-col items-center">
              {[
                lang === "ar" ? (
                  /* «يوم الزفاف» بخط عربي أنيق: أميري كبير بذهب دافئ
                     تحفّه شعيرتان ذهبيتان — لا تباعد أحرف لاتيني */
                  <div key="eyebrow" className="flex items-center justify-center gap-3 text-gold-dark">
                    <span aria-hidden className="h-px w-12 bg-gold/45" />
                    <p className="font-arabicText text-[1.7rem] leading-snug drop-shadow-sm">
                      {getDisplayText(data.hero.eyebrow, DEF.heroEyebrow)}
                    </p>
                    <span aria-hidden className="h-px w-12 bg-gold/45" />
                  </div>
                ) : (
                  <p
                    key="eyebrow"
                    className={`text-[0.72rem] uppercase tracking-[0.4em] text-gold-dark ${sansClass}`}
                  >
                    {getDisplayText(data.hero.eyebrow, DEF.heroEyebrow)}
                  </p>
                ),
                <h1
                  key="names"
                  className={`mt-6 text-5xl leading-tight text-ink sm:text-7xl ${scriptClass(lang)}`}
                >
                  {getDisplayText(data.couple.groomName, DEF.groomName)}
                  <span className="mx-3 align-middle text-4xl text-gold sm:text-5xl">&amp;</span>
                  {getDisplayText(data.couple.brideName, DEF.brideName)}
                </h1>,
                <div
                  key="ornament"
                  className="mx-auto mt-7 flex w-52 items-center gap-3 text-gold"
                  aria-hidden
                >
                  <span className="h-px flex-1 bg-gold/50" />
                  <span>❦</span>
                  <span className="h-px flex-1 bg-gold/50" />
                </div>,
                <p
                  key="date"
                  className={`mt-6 text-sm uppercase tracking-[0.35em] text-ink/70 ${sansClass}`}
                >
                  {getDisplayText(data.event.displayDate, DEF.heroDate)}
                </p>,
                <HeritageCountdown key="countdown" data={data} />,
                <DovesOrnament key="doves" className="mt-12" />,
              ].map((el, i) => (
                <motion.div
                  key={el.key}
                  className="flex w-full justify-center"
                  initial={{ opacity: 0, y: 26 }}
                  animate={opened ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }}
                  transition={{
                    duration: 0.6,
                    /* texts begin once the page opacity crosses ~0.75
                       (≈t=1900ms): subtitle → names → date → … */
                    delay: (reduceMotion ? 0.3 : 1.9) + i * (reduceMotion ? 0.05 : 0.13),
                    ease: EASE,
                  }}
                >
                  {el}
                </motion.div>
              ))}

              {/* soft scroll invitation to the RSVP section — spaced small
                  caps, bronze, a hairline and a gently bobbing chevron; a
                  whisper, never a big button */}
              {data.rsvp.enabled && (
                <motion.button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("rsvp")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }
                  initial={{ opacity: 0, y: 10 }}
                  animate={opened ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{
                    duration: 0.8,
                    /* enters last: after the names, date and countdown */
                    delay: reduceMotion ? 0.65 : 2.9,
                    ease: EASE,
                  }}
                  aria-label={ui.rsvpCta}
                  className="group mt-10 flex flex-col items-center gap-2.5 text-gold-dark/90 transition-opacity duration-300 hover:opacity-70"
                >
                  <span
                    className={
                      lang === "ar"
                        ? "font-arabicText text-lg"
                        : `text-[0.72rem] uppercase tracking-[0.18em] ${sansClass}`
                    }
                  >
                    {ui.rsvpCta}
                  </span>
                  <span aria-hidden className="h-px w-12 bg-gold-dark/35" />
                  <svg
                    aria-hidden
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-arrow-bob opacity-70"
                  >
                    <path d="m5 9 7 7 7-7" />
                  </svg>
                </motion.button>
              )}
            </div>
          </section>

          {/* WEDDING INVITATION — every line comes from the owner's
              dashboard fields (texts.invitation.{ar,fr}); nothing is
              hardcoded. Empty fields are hidden; the whole section hides
              when the owner filled nothing for the current language.
              Same visual identity: cream paper, bronze tones, heart
              ornament, doves artwork, staggered reveals. */}
          {inv && (
          <section className="h-soft-bg relative overflow-hidden bg-ivory-light px-4 py-20">
            <FloatingDecor />
            <Reveal>
              <SectionDivider className="mb-12" />
            </Reveal>
            <div
              dir={lang === "ar" ? "rtl" : "ltr"}
              className="mx-auto max-w-md text-center"
            >
              {inv.basmala && (
                <Reveal>
                  <p dir="rtl" className="font-arabicText text-2xl leading-relaxed text-ink sm:text-3xl">
                    {inv.basmala}
                  </p>
                </Reveal>
              )}
              {(inv.fatherName || inv.motherName || inv.invitationText) && (
                <Reveal delay={0.08}>
                  {/* the template frames the RAW names: "السيد X وحرمه"
                      + "Y" in Arabic, "Monsieur X" + "et son épouse Y"
                      in French — the owner types only the names */}
                  {inv.fatherName && (
                    <p className={`mt-9 text-2xl leading-relaxed text-ink/90 ${invFont}`}>
                      {ui.fatherPrefix}
                      {inv.fatherName}
                      {ui.fatherSuffix}
                    </p>
                  )}
                  {inv.motherName && (
                    <p className={`mt-1 text-2xl text-ink/90 ${invFont}`}>
                      {ui.motherPrefix}
                      {inv.motherName}
                    </p>
                  )}
                  {inv.invitationText && (
                    <p className={`mt-4 text-lg leading-relaxed text-ink/65 ${invFont} ${invItalic}`}>
                      {inv.invitationText}
                      {/* FR: the gendered word completes this very line —
                          "…du mariage de leur fille" — the name itself
                          stands alone below as a signature */}
                      {lang !== "ar" && inv.honoreeGender === "male" && ` ${ui.son}`}
                      {lang !== "ar" && inv.honoreeGender === "female" && ` ${ui.daughter}`}
                    </p>
                  )}
                </Reveal>
              )}
              {inv.mainTitle && (
                <Reveal delay={0.16}>
                  <h2
                    className={`mt-6 leading-snug text-ink ${
                      lang === "ar"
                        ? "font-arabicText text-5xl sm:text-6xl"
                        : "text-6xl [font-family:var(--font-heritage-script)] sm:text-7xl"
                    }`}
                  >
                    {inv.mainTitle}
                  </h2>
                  <HeartDivider className="mt-5" />
                </Reveal>
              )}
              {inv.brideName && (
                <Reveal delay={0.2}>
                  {/* AR keeps the gendered word (ابنهما/ابنتهما) as its
                      own quiet line right above the name */}
                  {lang === "ar" && inv.honoreeGender && (
                    <p className={`mt-5 text-lg leading-relaxed text-ink/65 ${invFont}`}>
                      {inv.honoreeGender === "male" ? ui.son : ui.daughter}
                    </p>
                  )}
                  {/* the name alone — a luxury handwritten signature:
                      Allura 400, 58px on phones / 72px on desktop, the
                      invitation's dark ink, generous breathing room */}
                  <p
                    className="mt-6 text-[58px] leading-[1.15] text-ink sm:text-[72px]"
                    style={{
                      fontFamily:
                        "var(--font-heritage-bride), 'Italianno', var(--font-heritage-script), 'Amiri', cursive",
                      fontWeight: 400,
                    }}
                  >
                    {inv.brideName}
                  </p>
                  {/* thin gold divider — outlined heart centered between
                      two hairlines, directly under the signature */}
                  <HeartDivider className="mt-6" />
                </Reveal>
              )}
              {(inv.dateIntro || inv.weddingDate || inv.time) && (
                <Reveal delay={0.24}>
                  {inv.dateIntro && (
                    <p className={`mt-9 text-base text-ink/60 ${invFont} ${invItalic}`}>
                      {inv.dateIntro}
                    </p>
                  )}
                  {inv.weddingDate && (
                    <p className={`mt-2 text-2xl font-medium text-ink ${invFont}`}>
                      {inv.weddingDate}
                    </p>
                  )}
                  {inv.time && (
                    <p className={`mt-1 text-lg text-ink/80 ${invFont}`}>{inv.time}</p>
                  )}
                </Reveal>
              )}
              {(inv.hallIntro || inv.hallName) && (
                <Reveal delay={0.32}>
                  {inv.hallIntro && (
                    <p className={`mt-8 text-base text-ink/60 ${invFont}`}>{inv.hallIntro}</p>
                  )}
                  {inv.hallName && (
                    /* hall name in the elegant high-contrast serif (the
                       template's title face) — script fonts fall apart on
                       latin all-caps venue names like "AB PARK" */
                    <p
                      dir="auto"
                      className={`mt-1 text-3xl font-medium tracking-[0.06em] text-gold-dark sm:text-4xl ${serifClass(lang)}`}
                    >
                      {inv.hallName}
                    </p>
                  )}
                </Reveal>
              )}
              {inv.footerMessage && (
                <Reveal delay={0.4}>
                  <p className={`mt-9 text-base leading-relaxed text-ink/70 ${invFont} ${invItalic}`}>
                    {inv.footerMessage}
                  </p>
                </Reveal>
              )}
            </div>
            {/* the owner's vintage doves-and-blossoms artwork closes the
                invitation */}
            <Reveal delay={0.1}>
              <img
                src="/assets/templates/heritage-doves.png"
                alt=""
                aria-hidden
                loading="lazy"
                width={1000}
                height={600}
                className="mx-auto mt-8 h-auto w-full max-w-xs sm:max-w-sm"
              />
            </Reveal>
          </section>
          )}

          {/* 3 — DAY PROGRAM: beige band, pink tab pill, rose timeline */}
          {program.length > 0 && (
            <section className="bg-[#3F4C2F] px-4 pb-16 pt-20">
              <Reveal>
                <div className="mb-8 text-center">
                  <h2 className={`text-5xl text-[#F2E7CE] ${scriptClass(lang)}`}>
                    {data.schedule.heading}
                  </h2>
                  <p className={`mt-3 text-sm text-[#E9DFC6]/80 ${sansClass}`}>{ui.programSub}</p>
                </div>
              </Reveal>
              <Reveal delay={0.06}>
                <div className="mb-10 flex justify-center">
                  <span
                    className={`rounded-full bg-gold-light px-5 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#3F4C2F] ${sansClass}`}
                  >
                    {data.event.displayDay} · {data.event.displayDateShort}
                  </span>
                </div>
              </Reveal>
              {/* مسار متحرك: خط يمتلئ، نقطة تسافر، ومحطات تشتعل تباعًا */}
              <ProgramTimeline program={program} lang={lang} />
            </section>
          )}

          {/* EVENT DETAILS: centered card, map, Maps/Calendar */}
          <section className="h-soft-bg relative overflow-hidden bg-ivory px-4 py-20">
            <FloatingDecor flip />
            <Reveal>
              <SectionHeading eyebrow={ui.joinUs} title={data.location.heading} lang={lang} />
            </Reveal>
            <Reveal delay={0.1}>
              <div className="relative mx-auto max-w-md rounded-[28px] border border-gold/20 bg-ivory-light/85 px-6 py-10 text-center shadow-[0_18px_50px_rgb(64_47_32_/_0.1)] sm:px-9">
                <span
                  aria-hidden
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-light/60 text-2xl text-gold-dark"
                >
                  ✦
                </span>
                {data.location.venueName && (
                  <p className={`mt-6 text-2xl font-medium text-ink ${serifClass(lang)}`}>
                    {data.location.venueName}
                  </p>
                )}
                <p className={`mt-4 flex items-center justify-center gap-2 text-base text-ink/80 ${sansClass}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                  {data.event.displayDay} {data.event.displayDate} · {data.event.displayTime}
                </p>
                {data.location.address && (
                  <p className={`mt-3 flex items-center justify-center gap-2 text-sm text-ink/65 ${sansClass}`}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" />
                      <circle cx="12" cy="10" r="2.6" />
                    </svg>
                    {data.location.address}
                  </p>
                )}
                {/* map — real embed when configured, clean placeholder if not */}
                {data.location.mapEmbedUrl ? (
                  <iframe
                    title="map"
                    src={data.location.mapEmbedUrl}
                    loading="lazy"
                    className="mt-7 h-56 w-full rounded-2xl border border-ink/10"
                  />
                ) : (
                  <div
                    aria-hidden
                    className="mt-7 flex h-44 w-full items-center justify-center rounded-2xl bg-ivory-dark/70"
                  >
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="rgb(67 51 43 / 0.35)" strokeWidth="1.4" aria-hidden>
                      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" />
                      <circle cx="12" cy="10" r="2.6" />
                    </svg>
                  </div>
                )}
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  {data.location.mapLinkUrl && (
                    <a
                      href={data.location.mapLinkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`h-btn flex items-center gap-2 rounded-xl border border-gold/60 bg-white/40 px-4 py-2.5 text-xs text-gold-dark hover:bg-gold-light/40 ${sansClass}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                        <path d="M21 3 10 14M21 3l-7 18-3-8-8-3 18-7Z" />
                      </svg>
                      Google Maps
                    </a>
                  )}
                  {calendarUrl && (
                    <a
                      href={calendarUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`h-btn flex items-center gap-2 rounded-xl border border-gold/60 bg-white/40 px-4 py-2.5 text-xs text-gold-dark hover:bg-gold-light/40 ${sansClass}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                        <rect x="3" y="5" width="18" height="16" rx="2" />
                        <path d="M8 3v4m8-4v4M3 10h18" />
                      </svg>
                      {ui.calendar}
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          </section>

          {/* GALLERY — the owner's photos, right after the venue. Hidden
              entirely (no gap) when the owner added no photos. */}
          {galleryImages.length > 0 && (
            <section className="h-soft-bg relative overflow-hidden bg-ivory px-4 py-20">
              <FloatingDecor />
              <Reveal>
                <SectionDivider className="mb-12" />
              </Reveal>
              <Reveal>
                <SectionHeading
                  eyebrow={ui.galleryEyebrow}
                  title={ui.galleryTitle}
                  lang={lang}
                />
              </Reveal>
              <Reveal delay={0.05}>
                <p className={`mx-auto -mt-4 mb-9 max-w-md text-center text-base leading-relaxed text-ink/70 ${sansClass}`}>
                  {ui.gallerySub}
                </p>
              </Reveal>
              <HeritageGallery images={galleryImages} />
            </section>
          )}

          {/* 6 — RSVP: very light blush, white card form */}
          {data.rsvp.enabled && (
            <section id="rsvp" className="h-soft-bg relative overflow-hidden bg-ivory px-4 py-20 scroll-mt-4">
              <FloatingDecor />
              <Reveal>
                <SectionDivider className="mb-12" />
              </Reveal>
              <Reveal>
                <SectionHeading
                  eyebrow={ui.beOurGuest}
                  title={getDisplayText(data.rsvp.heading, DEF.rsvpTitle)}
                  lang={lang}
                />
              </Reveal>
              <p className={`mx-auto -mt-4 mb-9 max-w-md text-center text-base leading-relaxed text-ink/70 ${sansClass}`}>
                {data.rsvp.subheading}
              </p>
              <div className="relative">
                <HeritageRsvp data={data} sansClass={sansClass} />
              </div>
            </section>
          )}

          {/* questions card — soft pink panel with real contact links */}
          {(data.contact?.phone || data.contact?.whatsapp) && (
            <section className="h-soft-bg bg-ivory px-4 py-20">
              <Reveal>
                <SectionDivider className="mb-12" />
              </Reveal>
              <Reveal delay={0.06}>
                <div className="mx-auto max-w-md rounded-[28px] border border-gold-dark/15 bg-[#F1D8BE] px-6 py-10 text-center shadow-[0_16px_45px_rgb(64_47_32_/_0.1)]">
                  <h2 className={`text-3xl font-medium text-ink ${serifClass(lang)}`}>
                    {ui.questions}
                  </h2>
                  <p className={`mt-4 text-sm leading-[1.7] text-ink/70 ${sansClass}`}>
                    {data.thankYou.message}
                  </p>
                  <div className="mt-6 space-y-3">
                    {data.contact.phone && (
                      <a
                        href={`tel:${data.contact.phone}`}
                        className={`flex items-center justify-center gap-2 text-sm text-gold-dark transition-opacity hover:opacity-75 ${sansClass}`}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                          <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
                        </svg>
                        {data.contact.phone}
                      </a>
                    )}
                    {data.contact.whatsapp && data.contact.whatsapp !== data.contact.phone && (
                      <a
                        href={`https://wa.me/${data.contact.whatsapp.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className={`flex items-center justify-center gap-2 text-sm text-gold-dark transition-opacity hover:opacity-75 ${sansClass}`}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                          <path d="M21 12a9 9 0 0 1-13.4 7.9L3 21l1.1-4.6A9 9 0 1 1 21 12Z" />
                        </svg>
                        {data.contact.whatsapp}
                      </a>
                    )}
                  </div>
                </div>
              </Reveal>
            </section>
          )}

          {/* 8 — FOOTER: dark brown, script names, date, small line */}
          <footer className="bg-[#3F4C2F] px-4 py-16 text-center">
            {/* couple names, not texts.signature: the config fallback would
                sign every platform wedding with the demo couple */}
            <p className={`text-5xl text-[#EFD9B8] ${scriptClass(lang)}`}>
              {data.couple.groomName} &amp; {data.couple.brideName}
            </p>
            <p className={`mt-4 text-sm tracking-[0.2em] text-[#DBD2B6]/85 ${sansClass}`}>
              {data.event.displayDate}
            </p>
            <p className={`mt-6 flex items-center justify-center gap-2 text-sm text-[#DBD2B6]/75 ${sansClass}`}>
              {ui.madeWith}
              <span aria-hidden className="text-[#E4A97C]">
                ♥
              </span>
              {ui.forOurDay}
            </p>
            {data.thankYou.dua && (
              <p className="mt-5 font-arabicText text-xl text-[#EFD9B8]/80">{data.thankYou.dua}</p>
            )}
            {hashtag && (
              <>
                <div className="mx-auto mt-8 h-px max-w-sm bg-[#DBD2B6]/20" aria-hidden />
                <p className={`mt-6 text-sm tracking-widest text-[#DBD2B6]/55 ${sansClass}`}>
                  {hashtag}
                </p>
              </>
            )}
          </footer>
        </main>

        {data.music && <MusicPlayer src={data.music} openingSrc={data.openingSound} started={opened} />}
      </div>
    </div>
  );
}
