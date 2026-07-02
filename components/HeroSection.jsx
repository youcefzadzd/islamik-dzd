"use client";

import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

const item = {
  hidden: { opacity: 0, y: 28 },
  show: (delay) => ({ opacity: 1, y: 0, transition: { duration: 1, delay, ease: EASE } }),
};

export default function HeroSection({ data, revealed }) {
  const state = revealed ? "show" : "hidden";

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center overflow-hidden text-center">
      {/* hero background */}
      <img
        src={data.assets.heroBackground}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        draggable={false}
      />
      {/* legibility veils */}
      <div className="absolute inset-0 bg-gradient-to-b from-ivory-light/55 via-transparent to-ivory/80" />

      <div className="relative z-10 flex min-h-[100svh] w-full max-w-md flex-col items-center justify-center px-6 pb-24 pt-14">
        <motion.p
          variants={item}
          initial="hidden"
          animate={state}
          custom={0.15}
          className="rtl font-arabicText text-lg text-burgundy-dark drop-shadow-sm sm:text-xl"
        >
          {data.hero.bismillah}
        </motion.p>

        <motion.h1
          variants={item}
          initial="hidden"
          animate={state}
          custom={0.4}
          className="mt-8 font-monogram text-5xl text-gold-dark sm:text-6xl"
        >
          {data.hero.eyebrow}
        </motion.h1>

        <motion.p
          variants={item}
          initial="hidden"
          animate={state}
          custom={0.6}
          className="mt-3 font-serif text-xl tracking-[0.25em] text-ink/80"
        >
          {data.event.displayDateShort}
        </motion.p>

        <motion.div variants={item} initial="hidden" animate={state} custom={0.85} className="mt-12">
          <p className="font-monogram text-6xl leading-tight text-gold-dark sm:text-7xl">
            {data.couple.groomName}
          </p>
          <p className="my-1 font-monogram text-3xl text-gold">&amp;</p>
          <p className="font-monogram text-6xl leading-tight text-gold-dark sm:text-7xl">
            {data.couple.brideName}
          </p>
        </motion.div>

        <motion.p
          variants={item}
          initial="hidden"
          animate={state}
          custom={1.05}
          className="rtl mt-6 font-arabicDisplay text-2xl text-burgundy/80"
        >
          {data.couple.groomNameAr} ♥ {data.couple.brideNameAr}
        </motion.p>
      </div>

      {/* scroll down indicator */}
      <motion.div
        variants={item}
        initial="hidden"
        animate={state}
        custom={1.4}
        className="absolute bottom-8 z-10 flex flex-col items-center gap-1 text-gold-dark"
      >
        <span className="font-monogram text-2xl">{data.hero.scrollHintText}</span>
        <motion.svg
          animate={{ y: [0, 7, 0] }}
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
