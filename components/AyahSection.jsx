"use client";

import { motion } from "framer-motion";
import CornerFlourish from "./ornaments/CornerFlourish";
import PatternBackdrop from "./ornaments/PatternBackdrop";

export default function AyahSection({ data }) {
  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center px-6 py-24 text-center bg-emerald overflow-hidden">
      <PatternBackdrop className="absolute inset-0 w-full h-full text-gold/[0.06]" />
      <CornerFlourish className="absolute top-6 left-6 text-gold/50" />
      <CornerFlourish className="absolute top-6 right-6 text-gold/50" flipX />
      <CornerFlourish className="absolute bottom-6 left-6 text-gold/50" flipY />
      <CornerFlourish className="absolute bottom-6 right-6 text-gold/50" flipX flipY />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1 }}
        dir="rtl"
        className="relative z-10 max-w-xl"
      >
        <p className="font-arabicText text-3xl sm:text-4xl leading-[2.1] text-ivory text-balance">
          ﴿ {data.ayah.text} ﴾
        </p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 font-arabicText text-lg text-gold-light"
        >
          {data.ayah.reference}
        </motion.p>
      </motion.div>
    </section>
  );
}
