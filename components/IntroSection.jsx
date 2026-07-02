"use client";

import Reveal from "./Reveal";

export default function IntroSection({ data }) {
  const intro = data.intro;

  return (
    <section className="relative overflow-hidden bg-ivory px-6 py-20">
      <div aria-hidden className="paper-overlay" />
      <div className="relative invite-card text-center">
        <Reveal>
          <p className="rtl font-arabicText text-lg text-burgundy-dark">{data.hero.bismillah}</p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-8 space-y-1">
            {intro.calligraphyLines.map((line) => (
              <p key={line} className="font-monogram text-4xl text-gold-dark sm:text-5xl">
                {line}
              </p>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mt-8 space-y-2">
            {intro.messageLines.map((line) => (
              <p key={line} className="font-body text-lg leading-relaxed text-ink/85">
                {line}
              </p>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.4}>
          <div className="divider mt-10">
            <span className="text-gold">✦</span>
          </div>
          <p className="rtl mt-8 font-arabicText text-xl leading-loose text-ink/90">
            {intro.ayah.text}
          </p>
          <p className="rtl mt-3 font-arabicText text-sm text-gold-dark">{intro.ayah.reference}</p>
        </Reveal>
      </div>
    </section>
  );
}
