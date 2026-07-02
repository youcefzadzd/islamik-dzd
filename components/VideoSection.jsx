"use client";

import Reveal from "./Reveal";
import SectionPanel from "./SectionPanel";

const ARCH_RADIUS = "130px 130px 22px 22px";

export default function VideoSection({ data }) {
  const video = data.video;

  return (
    <SectionPanel>
      <div className="text-center">
        <Reveal>
          <h2 className="font-monogram text-4xl text-gold-dark sm:text-5xl">{video.heading}</h2>
          <p className="mt-3 font-body text-lg text-ink/75">{video.subheading}</p>
          <div className="divider mt-4">
            <span className="text-gold">✦</span>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          {/* the film sits under a Moorish arch, like the hero architecture */}
          <div className="lux-media mx-auto mt-8" style={{ borderRadius: ARCH_RADIUS }}>
            {video.embedUrl ? (
              <iframe
                src={video.embedUrl}
                title={video.heading}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="aspect-[4/3] w-full border-0 sm:aspect-video"
                style={{ borderRadius: ARCH_RADIUS }}
              />
            ) : (
              <div
                className="relative flex aspect-[4/3] w-full flex-col items-center justify-center gap-4 overflow-hidden sm:aspect-video"
                style={{ backgroundColor: "rgb(var(--color-ivory-dark))", borderRadius: ARCH_RADIUS }}
              >
                <div aria-hidden className="paper-tile" />
                <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-burgundy shadow-card">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="rgb(var(--color-ivory-light))" aria-hidden>
                    <path d="M8 5.5v13l11-6.5-11-6.5Z" />
                  </svg>
                </span>
                <p className="relative font-body text-lg italic text-ink/60">{video.placeholderText}</p>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </SectionPanel>
  );
}
