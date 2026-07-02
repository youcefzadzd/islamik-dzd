"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Reveal from "./Reveal";

/* ============ countdown logic (unchanged) ============ */
function remaining(targetDateISO) {
  const diff = new Date(targetDateISO).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}

/* ============ hand-drawn ornaments (pure SVG, no bitmaps) ============ */

/* arabesque corner scrollwork with a small burgundy accent */
function CornerOrnament({ className }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden className={className}>
      <path
        d="M4 116 C4 70 16 34 44 18 C66 6 92 4 116 4"
        stroke="#C9A961"
        strokeWidth="1.4"
        opacity="0.85"
      />
      <path
        d="M14 116 C14 78 25 44 50 28 C69 16 92 14 116 14"
        stroke="#C9A961"
        strokeWidth="0.9"
        opacity="0.55"
      />
      <path
        d="M24 100 C26 76 36 56 56 44 C50 58 48 74 52 88 C42 84 30 90 24 100 Z"
        stroke="#C9A961"
        strokeWidth="1"
        opacity="0.7"
      />
      <path
        d="M60 40 C70 30 84 26 96 28 C88 34 84 42 86 52 C76 50 66 44 60 40 Z"
        stroke="#C9A961"
        strokeWidth="1"
        opacity="0.7"
      />
      <circle cx="52" cy="88" r="2.4" stroke="#C9A961" strokeWidth="1" opacity="0.7" />
      <circle cx="86" cy="52" r="2.4" stroke="#C9A961" strokeWidth="1" opacity="0.7" />
      {/* burgundy corner accent */}
      <path d="M0 0 L26 0 C14 4 6 12 2 24 L0 26 Z" fill="#6E1F2B" opacity="0.85" />
      <path d="M6 6 L18 3 C11 7 8 11 5 18 Z" fill="#E4C866" opacity="0.5" />
    </svg>
  );
}

/* faint Andalusian eight-point rosette watermark */
function Rosette({ className, size = 260 }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden
      className={className}
      style={{ width: size, height: size }}
    >
      <g stroke="#B99043" strokeWidth="0.7">
        <rect x="22" y="22" width="56" height="56" />
        <rect x="22" y="22" width="56" height="56" transform="rotate(45 50 50)" />
        <circle cx="50" cy="50" r="18" />
        <circle cx="50" cy="50" r="27" />
        {Array.from({ length: 8 }, (_, k) => {
          const a = (k * Math.PI) / 4;
          return (
            <line
              key={k}
              x1={50 + 18 * Math.cos(a)}
              y1={50 + 18 * Math.sin(a)}
              x2={50 + 40 * Math.cos(a)}
              y2={50 + 40 * Math.sin(a)}
            />
          );
        })}
      </g>
    </svg>
  );
}

/* small calligraphic flourish at the top of each card */
function CardFlourish() {
  return (
    <svg viewBox="0 0 80 20" fill="none" aria-hidden className="h-4 w-20">
      <path
        d="M8 9 C18 1 30 3 36 9 M72 9 C62 1 50 3 44 9 M36 9 C38 13 42 13 44 9"
        stroke="#B99043"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="8" cy="9" r="1.6" fill="#B99043" />
      <circle cx="72" cy="9" r="1.6" fill="#B99043" />
      <rect x="38.4" y="14" width="3.2" height="3.2" transform="rotate(45 40 15.6)" fill="#B99043" />
    </svg>
  );
}

/* ============ number with soft roll + glow on change ============ */
function RollingNumber({ value, reduce }) {
  return (
    <div className="relative flex justify-center" style={{ height: "1.15em" }}>
      {/* soft gold glow pulsing once per change */}
      {!reduce && (
        <AnimatePresence>
          <motion.div
            key={"glow" + value}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.45, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, times: [0, 0.35, 1] }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[1.6em] w-[2.4em] -translate-x-1/2 -translate-y-1/2"
            style={{
              background: "radial-gradient(ellipse at center, rgb(228 200 102 / 0.5), transparent 70%)",
              filter: "blur(7px)",
            }}
          />
        </AnimatePresence>
      )}
      <div className="h-full overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={reduce ? false : { y: "0.7em", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? undefined : { y: "-0.7em", opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="block leading-none"
            style={{
              backgroundImage:
                "linear-gradient(168deg, #E9D394 8%, #C9A227 42%, #9C7A1B 68%, #E4C866 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ============ one countdown card: layered handmade paper ============ */
function CountCard({ value, label, index, reduce }) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay: index * 0.13, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div whileHover={reduce ? undefined : { y: -5 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
        <motion.div
          animate={reduce ? undefined : { y: [0, -2.5, 0], scale: [1, 1.006, 1] }}
          transition={{ duration: 5.5 + index * 0.8, repeat: Infinity, ease: "easeInOut", delay: index * 0.9 }}
        >
          <div
            className="flex aspect-[4/5] flex-col items-center justify-between rounded-[24px] px-2 pb-5 pt-6 sm:aspect-[3/4]"
            style={{
              backgroundColor: "#FBF7ED",
              border: "1px solid rgb(201 169 97 / 0.55)",
              boxShadow:
                // stacked second sheet of paper, ambient shadow, embossed edges
                "3px 4px 0 #E9DFC9, 10px 14px 26px rgb(150 118 66 / 0.16), inset 0 1px 0 rgb(255 255 255 / 0.9), inset 0 -2px 3px rgb(180 150 90 / 0.12)",
            }}
          >
            <CardFlourish />
            <div className="font-serif text-5xl tabular-nums sm:text-5xl">
              <RollingNumber value={value} reduce={reduce} />
            </div>
            <p className="font-serif text-sm capitalize tracking-[0.08em] text-ink/85 sm:text-base">
              {label}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function CountdownSection({ data }) {
  const countdown = data.countdown;
  const reduce = useReducedMotion();
  // undefined until mounted so the server render never mismatches the client clock
  const [time, setTime] = useState(undefined);

  useEffect(() => {
    const tick = () => setTime(remaining(data.event.dateTimeISO));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data.event.dateTimeISO]);

  const units = ["days", "hours", "minutes", "seconds"];

  return (
    <section className="relative overflow-hidden px-6 py-24" style={{ backgroundColor: "#F8F3EA" }}>
      {/* handmade paper grain */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "url(/assets/paper-texture.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          mixBlendMode: "multiply",
        }}
      />

      {/* faint geometric watermarks, like the reference */}
      <Rosette className="absolute -top-24 left-1/2 -translate-x-1/2 opacity-[0.06]" size={320} />
      <Rosette className="absolute -left-24 top-1/3 opacity-[0.05]" size={240} />
      <Rosette className="absolute -right-24 top-1/2 opacity-[0.05]" size={240} />
      <Rosette className="absolute -bottom-20 left-[12%] opacity-[0.05]" size={200} />

      {/* thin gold frame with arabesque corners and burgundy accents */}
      <div aria-hidden className="pointer-events-none absolute inset-3 rounded-sm border border-[#C9A961]/35 sm:inset-4" />
      <div aria-hidden className="pointer-events-none absolute inset-[18px] rounded-sm border border-[#C9A961]/20 sm:inset-6" />
      <CornerOrnament className="absolute left-1 top-1 w-24 sm:w-36" />
      <CornerOrnament className="absolute right-1 top-1 w-24 -scale-x-100 sm:w-36" />
      <CornerOrnament className="absolute bottom-1 left-1 w-24 -scale-y-100 sm:w-36" />
      <CornerOrnament className="absolute bottom-1 right-1 w-24 -scale-x-100 -scale-y-100 sm:w-36" />

      <div className="relative invite-card text-center">
        <Reveal>
          <h2 className="font-monogram text-4xl text-gold-dark sm:text-5xl">{countdown.heading}</h2>
          <p className="rtl mt-3 font-arabicText text-lg text-burgundy-dark">{countdown.subtitleAr}</p>
          <div className="divider mt-5">
            <span className="text-gold">✦</span>
          </div>
        </Reveal>

        {time === null ? (
          <Reveal delay={0.2}>
            <p className="mt-12 font-serif text-2xl text-burgundy">{countdown.expiredText}</p>
          </Reveal>
        ) : (
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
            {units.map((unit, index) => (
              <CountCard
                key={unit}
                index={index}
                value={time ? String(time[unit]).padStart(2, "0") : "--"}
                label={countdown.labels[unit]}
                reduce={reduce}
              />
            ))}
          </div>
        )}

        <Reveal delay={0.3}>
          <div className="divider mt-14">
            <span className="text-xs text-gold">❦</span>
          </div>
          <div className="mt-6 flex items-center justify-center gap-4 font-serif text-lg text-ink/80">
            <span>{data.event.displayDay}</span>
            <span className="text-gold">✦</span>
            <span>{data.event.displayDate}</span>
            <span className="text-gold">✦</span>
            <span>{data.event.displayTime}</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
