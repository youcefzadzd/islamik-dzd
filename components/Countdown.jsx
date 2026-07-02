"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function getTimeLeft(targetISO) {
  const diff = +new Date(targetISO) - +new Date();
  const clamped = Math.max(diff, 0);
  return {
    days: Math.floor(clamped / (1000 * 60 * 60 * 24)),
    hours: Math.floor((clamped / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((clamped / (1000 * 60)) % 60),
    seconds: Math.floor((clamped / 1000) % 60),
  };
}

const LABELS = { days: "Jours", hours: "Heures", minutes: "Min", seconds: "Sec" };

function Unit({ value, label }) {
  return (
    <div className="flex flex-col items-center w-16 sm:w-20">
      <div className="relative w-full aspect-square rounded-lg bg-emerald text-ivory shadow-card overflow-hidden border border-gold/40 flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="font-serif text-2xl sm:text-3xl"
          >
            {String(value).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-2 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gold-dark">
        {label}
      </span>
    </div>
  );
}

export default function Countdown({ targetDateISO }) {
  const [time, setTime] = useState(null);

  useEffect(() => {
    setTime(getTimeLeft(targetDateISO));
    const id = setInterval(() => setTime(getTimeLeft(targetDateISO)), 1000);
    return () => clearInterval(id);
  }, [targetDateISO]);

  if (!time) return <div className="h-40 bg-ivory-light" />;

  return (
    <section className="px-6 py-16 bg-ivory-light text-center">
      <p className="uppercase tracking-[0.3em] text-xs text-gold-dark mb-6">
        Compte à rebours
      </p>
      <div className="flex items-center justify-center gap-3 sm:gap-5">
        <Unit value={time.days} label={LABELS.days} />
        <Unit value={time.hours} label={LABELS.hours} />
        <Unit value={time.minutes} label={LABELS.minutes} />
        <Unit value={time.seconds} label={LABELS.seconds} />
      </div>
    </section>
  );
}
