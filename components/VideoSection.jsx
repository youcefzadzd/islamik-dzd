"use client";

import Reveal from "./Reveal";

export default function VideoSection({ data }) {
  const video = data.video;

  return (
    <section className="bg-ivory px-6 py-20">
      <div className="invite-card text-center">
        <Reveal>
          <h2 className="font-monogram text-4xl text-gold-dark sm:text-5xl">{video.heading}</h2>
          <p className="mt-3 font-body text-lg text-ink/75">{video.subheading}</p>
          <div className="divider mt-4">
            <span className="text-gold">✦</span>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-8 overflow-hidden rounded-3xl border border-gold/50 shadow-card">
            {video.embedUrl ? (
              <iframe
                src={video.embedUrl}
                title={video.heading}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full border-0"
              />
            ) : (
              <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-4 bg-ivory-dark">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-burgundy shadow-card">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="rgb(var(--color-ivory-light))" aria-hidden>
                    <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                  </svg>
                </span>
                <p className="font-body text-lg italic text-ink/60">{video.placeholderText}</p>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
