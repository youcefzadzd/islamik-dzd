"use client";

import { useMemo } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  useReducedMotion,
} from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];
const GLIDE_EASE = [0.45, 0.05, 0.25, 1]; // slow, smooth ease-in-out for the swans

const item = {
  hidden: { opacity: 0, y: 28 },
  show: (delay) => ({ opacity: 1, y: 0, transition: { duration: 1, delay, ease: EASE } }),
};

/* deterministic PRNG so the petal field renders identically on server + client */
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PETAL_COLORS = ["#f6dfe1", "#fbf0dc", "#f3e6c2", "#f9e8e6"];

function makePetals(count) {
  const rnd = mulberry32(20260814);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: rnd() * 100,
    size: 9 + rnd() * 10,
    dur: 9 + rnd() * 8,
    delay: -rnd() * 17, // negative: the sky is already full on arrival
    sway: 10 + rnd() * 26,
    swayDur: 2.6 + rnd() * 2.2,
    rot: 140 + rnd() * 220,
    opacity: 0.45 + rnd() * 0.35,
    color: PETAL_COLORS[Math.floor(rnd() * PETAL_COLORS.length)],
  }));
}

function Petal({ p }) {
  return (
    <span
      className="petal"
      style={{
        left: `${p.left}%`,
        "--dur": `${p.dur}s`,
        "--delay": `${p.delay}s`,
        "--sway": `${p.sway}px`,
        "--sway-dur": `${p.swayDur}s`,
        "--rot": `${p.rot}deg`,
        "--po": p.opacity,
      }}
    >
      <span>
        <svg width={p.size} height={p.size} viewBox="0 0 24 24" aria-hidden>
          <path
            d="M12 2 C17.5 6.5 19 12.5 12 22 C5 12.5 6.5 6.5 12 2 Z"
            fill={p.color}
            fillOpacity="0.9"
          />
        </svg>
      </span>
    </span>
  );
}

/* one swan: a true transparent cutout gliding on the water, with a CSS
   reflection (flipped, blurred, masked) and ripples at the waterline */
function Swan({ side, src, revealed, reduce, style }) {
  const dir = side === "left" ? -1 : 1;

  // left swan starts further left, right swan further right, then they meet
  const startX = `${dir * 42}%`;
  const glide = reduce ? { x: "0%" } : { x: revealed ? "0%" : startX };

  return (
    <motion.div
      initial={{ opacity: 0, x: reduce ? "0%" : startX }}
      animate={{ opacity: revealed ? 1 : 0, ...glide }}
      transition={{
        opacity: { duration: 0.9, delay: 0.6, ease: EASE },
        x: { duration: 4.6, delay: 0.9, ease: GLIDE_EASE },
      }}
      className="absolute"
      style={{ ...style, willChange: "transform" }}
    >
      {/* idle life: gentle bob + breathing, only after the glide */}
      <motion.div
        animate={
          reduce
            ? undefined
            : {
                y: [0, -2.2, 0, -1.2, 0],
                rotate: [0, 0.5, 0, -0.45, 0],
                scale: [1, 1.006, 1],
              }
        }
        transition={{ duration: 6.5, delay: 5.6, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
        style={{ transformOrigin: "50% 85%" }}
      >
        {/* soft ambient seat: grounds the body in the water */}
        <div
          aria-hidden
          className="absolute left-1/2 top-[86%] h-[26%] w-[108%] -translate-x-1/2 rounded-[50%]"
          style={{ background: "rgb(105 80 45 / 0.14)", filter: "blur(9px)" }}
        />

        {/* the swan body — real alpha, no background */}
        <motion.img
          src={src}
          alt=""
          draggable={false}
          animate={reduce ? undefined : { rotate: [0, dir * -0.8, dir * 0.5, 0] }}
          transition={{ duration: 4.6, delay: 0.9, times: [0, 0.45, 0.8, 1], ease: "easeInOut" }}
          className="relative w-full select-none"
          style={{
            transformOrigin: "50% 70%",
            filter: "drop-shadow(0 4px 6px rgb(95 65 30 / 0.28))",
          }}
        />

        {/* mirror reflection: flipped copy, softened and fading into the water */}
        <div aria-hidden className="reflection-sway absolute left-0 top-[96%] w-full">
          <img
            src={src}
            alt=""
            draggable={false}
            className="w-full select-none"
            style={{
              transform: "scaleY(-0.92)",
              opacity: 0.4,
              filter: "blur(2px)",
              WebkitMaskImage: "linear-gradient(to bottom, rgb(0 0 0 / 0.65), transparent 68%)",
              maskImage: "linear-gradient(to bottom, rgb(0 0 0 / 0.65), transparent 68%)",
            }}
          />
        </div>

        {/* subtle water displacement right under the body */}
        <div
          aria-hidden
          className="absolute left-1/2 top-[90%] h-[14%] w-[80%] -translate-x-1/2 rounded-[50%]"
          style={{ background: "rgb(90 70 40 / 0.2)", filter: "blur(5px)" }}
        />
        {/* expanding ripples at the waterline — starting while they glide */}
        {!reduce &&
          [1.4, 3.1, 5.5].map((d) => (
            <span
              key={d}
              aria-hidden
              className="swan-ripple absolute left-1/2 top-[97%] block h-[18%] w-[88%] rounded-[50%] border"
              style={{ borderColor: "rgb(255 255 255 / 0.45)", "--rdur": "3.4s", "--rdelay": `${d}s` }}
            />
          ))}
      </motion.div>
    </motion.div>
  );
}

export default function HeroSection({ data, revealed }) {
  const state = revealed ? "show" : "hidden";
  const reduce = useReducedMotion();
  const petals = useMemo(() => makePetals(20), []);

  /* --- parallax: mouse/touch springs + slow scroll drift for the background */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sceneX = useSpring(useTransform(mx, [-1, 1], [7, -7]), { stiffness: 45, damping: 18 });
  const sceneMouseY = useSpring(useTransform(my, [-1, 1], [5, -5]), { stiffness: 45, damping: 18 });
  const { scrollY } = useScroll();
  const sceneScrollY = useTransform(scrollY, [0, 900], [0, 85]); // background lags the scroll
  const sceneY = useTransform(() => sceneMouseY.get() + sceneScrollY.get());
  const petalsX = useSpring(useTransform(mx, [-1, 1], [14, -14]), { stiffness: 45, damping: 18 });
  const petalsY = useSpring(useTransform(my, [-1, 1], [8, -8]), { stiffness: 45, damping: 18 });
  const contentX = useSpring(useTransform(mx, [-1, 1], [-2.5, 2.5]), { stiffness: 45, damping: 18 });

  function onPointerMove(e) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  }

  return (
    <section
      onPointerMove={onPointerMove}
      className="relative flex min-h-[100svh] flex-col items-center overflow-hidden text-center"
    >
      {/* ===== scene: background + water patch + living swans, one coordinate space ===== */}
      <div
        className="absolute left-1/2 top-1/2"
        style={{ width: "max(100vw, 100svh)", aspectRatio: "1 / 1", transform: "translate(-50%, -50%)" }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="absolute inset-0"
          style={{ x: reduce ? 0 : sceneX, y: reduce ? 0 : sceneY, scale: 1.035, willChange: "transform" }}
        >
          <img
            src={data.assets.heroBackground}
            alt=""
            className="h-full w-full select-none object-fill"
            draggable={false}
          />
          {/* still water covering the swans baked into the artwork */}
          <img
            src="/assets/hero-water-patch.webp"
            alt=""
            aria-hidden
            draggable={false}
            className="absolute select-none"
            style={{ left: "32.8%", top: "67.4%", width: "34.96%" }}
          />
          {/* living light drifting across the water surface (under the swans) */}
          {!reduce && (
            <div aria-hidden className="absolute inset-x-0 bottom-0 top-[62%] overflow-hidden">
              <div
                className="water-shimmer absolute inset-y-0 left-0 w-[200%]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgb(255 240 200 / 0.1) 22%, transparent 45%, rgb(255 238 195 / 0.07) 72%, transparent 100%)",
                  mixBlendMode: "screen",
                }}
              />
            </div>
          )}
          {/* the swans glide in and meet, necks closing the heart */}
          <Swan
            side="left"
            src="/assets/swan-left.png"
            revealed={revealed}
            reduce={reduce}
            style={{ left: "34.18%", top: "67.38%", width: "16.21%" }}
          />
          <Swan
            side="right"
            src="/assets/swan-right.png"
            revealed={revealed}
            reduce={reduce}
            style={{ left: "49.61%", top: "67.38%", width: "16.41%" }}
          />
        </motion.div>
      </div>

      {/* legibility veils — kept away from the water so the swans and lake
          stay fully visible; only the top text zone and the very bottom
          section hand-off are veiled */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[42%] bg-gradient-to-b from-ivory-light/50 via-ivory-light/20 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[8%] bg-gradient-to-b from-transparent to-ivory/90" />

      {/* cinematic golden light rays, almost imperceptible */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ duration: 1.4, delay: 0.5 }}
        className="pointer-events-none absolute inset-0 z-[2]"
      >
        <div
          className="hero-rays absolute inset-0"
          style={{
            background:
              "linear-gradient(112deg, transparent 40%, rgb(255 232 180 / 0.14) 46%, transparent 52%, transparent 58%, rgb(255 226 165 / 0.1) 65%, transparent 71%)",
            mixBlendMode: "screen",
            WebkitMaskImage: "linear-gradient(to bottom, black 15%, transparent 80%)",
            maskImage: "linear-gradient(to bottom, black 15%, transparent 80%)",
          }}
        />
      </motion.div>

      {/* endless flower petals */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ duration: 1.2, delay: 0.7 }}
        className="pointer-events-none absolute inset-0 z-[3] overflow-hidden"
      >
        <motion.div className="absolute inset-0" style={{ x: reduce ? 0 : petalsX, y: reduce ? 0 : petalsY }}>
          {petals.map((p) => (
            <Petal key={p.id} p={p} />
          ))}
        </motion.div>
      </motion.div>

      {/* ===== main content (almost static) ===== */}
      <motion.div
        className="relative z-10 flex min-h-[100svh] w-full max-w-md flex-col items-center justify-center px-6 pb-24 pt-14"
        style={{ x: reduce ? 0 : contentX }}
      >
        <motion.p
          variants={item}
          initial="hidden"
          animate={state}
          custom={0.1}
          className="rtl font-arabicText text-lg text-burgundy-dark drop-shadow-sm sm:text-xl"
        >
          {data.hero.bismillah}
        </motion.p>

        <motion.h1
          variants={item}
          initial="hidden"
          animate={state}
          custom={0.25}
          className="mt-8 font-monogram text-[clamp(2.2rem,12vw,3rem)] text-gold-dark sm:text-6xl"
        >
          {data.hero.eyebrow}
        </motion.h1>

        <motion.p
          variants={item}
          initial="hidden"
          animate={state}
          custom={0.4}
          className="mt-3 font-serif text-xl tracking-[0.25em] text-ink/80"
        >
          {data.event.displayDateShort}
        </motion.p>

        <motion.div variants={item} initial="hidden" animate={state} custom={0.55} className="mt-12">
          <p className="font-monogram text-[clamp(2.6rem,14vw,3.75rem)] leading-tight text-gold-dark sm:text-7xl">
            {data.couple.groomName}
          </p>
          <p className="my-1 font-monogram text-3xl text-gold">&amp;</p>
          <p className="font-monogram text-[clamp(2.6rem,14vw,3.75rem)] leading-tight text-gold-dark sm:text-7xl">
            {data.couple.brideName}
          </p>
        </motion.div>

        <motion.p
          variants={item}
          initial="hidden"
          animate={state}
          custom={0.7}
          className="rtl mt-6 font-arabicText text-2xl text-burgundy/80"
        >
          {data.couple.groomNameAr} ♥ {data.couple.brideNameAr}
        </motion.p>
      </motion.div>

      {/* scroll down indicator */}
      <motion.div
        variants={item}
        initial="hidden"
        animate={state}
        custom={0.85}
        className="absolute bottom-8 z-10 flex flex-col items-center gap-1 text-gold-dark"
      >
        <span className="font-monogram text-2xl">{data.hero.scrollHintText}</span>
        <motion.svg
          animate={reduce ? undefined : { y: [0, 7, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          width="26"
          height="14"
          viewBox="0 0 26 14"
          fill="none"
          aria-hidden
        >
          <path d="M2 2 L13 12 L24 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </motion.svg>
      </motion.div>
    </section>
  );
}
