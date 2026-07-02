"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "./Reveal";

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

/* the value rolls softly upward whenever it changes */
function RollingNumber({ value }) {
  return (
    <div className="relative flex justify-center overflow-hidden" style={{ height: "1.2em" }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "0.7em", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-0.7em", opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="block leading-none"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default function CountdownSection({ data }) {
  const countdown = data.countdown;
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
    <section className="relative overflow-hidden bg-ivory-dark/60 px-6 py-20">
      {/* textured paper behind the glass cards */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage: "url(/assets/paper-texture.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="relative invite-card text-center">
        <Reveal>
          <h2 className="font-monogram text-4xl text-gold-dark sm:text-5xl">{countdown.heading}</h2>
          <p className="rtl mt-3 font-arabicText text-lg text-burgundy-dark">{countdown.subtitleAr}</p>
          <div className="divider mt-5">
            <span className="text-gold">✦</span>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          {time === null ? (
            <p className="mt-10 font-serif text-2xl text-burgundy">{countdown.expiredText}</p>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {units.map((unit) => (
                <div
                  key={unit}
                  className="relative rounded-2xl border border-gold/40 bg-ivory-light/65 px-2 pb-4 pt-5 shadow-card backdrop-blur-[2px]"
                >
                  {/* hairline inner frame, like gilded stationery */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-[5px] rounded-xl border border-gold/20"
                  />
                  <div className="font-serif text-4xl text-burgundy tabular-nums sm:text-5xl">
                    <RollingNumber value={time ? String(time[unit]).padStart(2, "0") : "--"} />
                  </div>
                  <p className="mt-2 text-[0.7rem] uppercase tracking-[0.25em] text-gold-dark">
                    {countdown.labels[unit]}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Reveal>

        <Reveal delay={0.35}>
          <div className="divider mt-10">
            <span className="text-gold text-xs">❦</span>
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
