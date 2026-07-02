"use client";

import { motion } from "framer-motion";
import CornerFlourish from "./ornaments/CornerFlourish";
import EightPointStar from "./ornaments/EightPointStar";

export default function DuaSection({ data }) {
  return (
    <section className="relative px-6 py-24 bg-emerald text-center overflow-hidden">
      <CornerFlourish className="absolute top-6 left-6 text-gold/40" />
      <CornerFlourish className="absolute top-6 right-6 text-gold/40" flipX />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.9 }}
        className="relative z-10 max-w-lg mx-auto"
      >
        <span className="inline-block text-gold mb-6">
          <EightPointStar size={28} />
        </span>
        <p dir="rtl" className="font-arabicText text-2xl sm:text-3xl leading-loose text-ivory text-balance">
          {data.dua.text}
        </p>
      </motion.div>
    </section>
  );
}
