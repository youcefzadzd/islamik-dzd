"use client";

import { motion } from "framer-motion";
import EightPointStar from "./ornaments/EightPointStar";
import GsapDivider from "./GsapDivider";

function NameBlock({ nameAr, nameFr, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.9, delay }}
      className="text-center"
    >
      <p dir="rtl" className="font-arabicDisplay text-5xl sm:text-6xl text-emerald leading-none">
        {nameAr}
      </p>
      <p className="mt-2 font-serif text-2xl sm:text-3xl tracking-wide text-ink">{nameFr}</p>
    </motion.div>
  );
}

export default function CoupleNames({ data }) {
  const { couple } = data;
  const first =
    couple.order?.[0] === "bride"
      ? { ar: couple.brideNameAr, fr: couple.brideNameFr }
      : { ar: couple.groomNameAr, fr: couple.groomNameFr };
  const second =
    couple.order?.[0] === "bride"
      ? { ar: couple.groomNameAr, fr: couple.groomNameFr }
      : { ar: couple.brideNameAr, fr: couple.brideNameFr };

  return (
    <section className="px-6 py-24 bg-ivory-light text-center">
      <div className="invite-card flex flex-col items-center gap-8">
        <NameBlock nameAr={first.ar} nameFr={first.fr} delay={0} />

        <span className="text-gold">
          <EightPointStar size={28} />
        </span>

        <NameBlock nameAr={second.ar} nameFr={second.fr} delay={0.15} />

        <GsapDivider className="mt-4" />
      </div>
    </section>
  );
}
