"use client";

import Reveal from "./Reveal";

export default function ThankYouSection({ data }) {
  const thankYou = data.thankYou;

  return (
    <section className="relative overflow-hidden px-6 py-24 text-center">
      <img
        src={data.assets.thankYouBackground}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ivory via-ivory/70 to-ivory/90" />

      <div className="relative invite-card">
        <Reveal>
          <h2 className="font-monogram text-5xl text-gold-dark sm:text-6xl">{thankYou.heading}</h2>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mt-6 font-serif text-xl text-ink/85">{thankYou.message}</p>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="divider mt-10">
            <span className="text-gold">✦</span>
          </div>
          <p className="rtl mt-8 font-arabicText text-xl leading-loose text-burgundy-dark">
            {thankYou.dua}
          </p>
        </Reveal>

        <Reveal delay={0.45}>
          <p className="mt-10 font-monogram text-4xl text-gold-dark">{thankYou.signatureNames}</p>
        </Reveal>
      </div>
    </section>
  );
}
