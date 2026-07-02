"use client";

import Reveal from "./Reveal";

export default function LocationSection({ data }) {
  const location = data.location;

  return (
    <section className="relative overflow-hidden bg-ivory-dark px-6 py-20">
      <div aria-hidden className="paper-overlay" />
      <div className="relative invite-card text-center">
        <Reveal>
          <h2 className="font-monogram text-4xl text-gold-dark sm:text-5xl">{location.heading}</h2>
          <div className="divider mt-4">
            <span className="text-gold">✦</span>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mt-8 font-serif text-3xl text-burgundy">{location.venueName}</p>
          <p className="mt-2 font-body text-lg text-ink/80">{location.address}</p>
        </Reveal>

        {location.mapEmbedUrl ? (
          <Reveal delay={0.25}>
            <div className="lux-media mt-8">
              <iframe
                src={location.mapEmbedUrl}
                title={location.venueName}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="h-72 w-full border-0"
              />
            </div>
          </Reveal>
        ) : null}

        <Reveal delay={0.35}>
          <a
            href={location.mapLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-burgundy px-8 py-3 text-sm uppercase tracking-[0.2em] text-ivory-light shadow-card transition-colors hover:bg-burgundy-dark"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            {location.buttonText}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
