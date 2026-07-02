"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Reveal from "./Reveal";
import SectionPanel from "./SectionPanel";
import { CardFlourish } from "./ornaments";

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
              background: "radial-gradient(ellipse at center, rgb(216 189 122 / 0.5), transparent 70%)",
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
                "linear-gradient(168deg, #E7D6A8 8%, #C6A15B 42%, #8F7136 68%, #D8BD7A 100%)",
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
          <div className="lux-card flex aspect-[4/5] flex-col items-center justify-between px-2 pb-5 pt-6 sm:aspect-[3/4]">
            <CardFlourish className="relative h-4 w-16" />
            <div className="relative font-serif text-5xl tabular-nums">
              <RollingNumber value={value} reduce={reduce} />
            </div>
            <p className="relative font-serif text-sm capitalize tracking-[0.08em] text-ink/85 sm:text-base">
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
    <SectionPanel>
      <div className="text-center">
        <Reveal>
          <h2 className="font-monogram text-4xl text-gold-dark sm:text-5xl">{countdown.heading}</h2>
          <p className="rtl mt-3 font-arabicText text-lg text-burgundy-dark">{countdown.subtitleAr}</p>
          <div className="divider mt-5">
            <span className="text-gold">✦</span>
          </div>
        </Reveal>

        {time === null ? (
          <Reveal delay={0.2}>
            <p className="mt-10 font-serif text-2xl text-burgundy">{countdown.expiredText}</p>
          </Reveal>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
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
          <div className="divider mt-10">
            <span className="text-gold">✦</span>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-serif text-lg text-ink/80">
            <span>{data.event.displayDay}</span>
            <span className="text-gold">✦</span>
            <span>{data.event.displayDate}</span>
            <span className="text-gold">✦</span>
            <span>{data.event.displayTime}</span>
          </div>
        </Reveal>
      </div>
    </SectionPanel>
  );
}
