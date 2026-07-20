"use client";

import Reveal from "./Reveal";

export default function ThankYouSection({ data }) {
  const thankYou = data.thankYou;

  return (
    <section className="relative overflow-hidden px-6 py-20 text-center">
      <img
        src={data.assets.thankYouBackground}
        alt=""
        className="lux-grade absolute inset-0 h-full w-full object-cover object-center"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ivory via-ivory/55 to-ivory/85" />

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

        {/* contact links, only when set in wedding-config.json */}
        {(data.contact?.phone || data.contact?.whatsapp) && (
          <Reveal delay={0.55}>
            <p className="mt-8 text-xs uppercase tracking-[0.25em] text-gold-dark">
              {thankYou.contactLabel}
            </p>
            <div className="mt-3 flex items-center justify-center gap-5 font-body text-lg">
              {data.contact.phone && (
                <a
                  href={`tel:${data.contact.phone}`}
                  className="inline-flex items-center gap-2 text-ink/85 underline-offset-4 hover:underline"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
                    <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
                  </svg>
                  <span dir="ltr">{data.contact.phone}</span>
                </a>
              )}
              {data.contact.whatsapp && (
                <a
                  href={`https://wa.me/${data.contact.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-ink/85 underline-offset-4 hover:underline"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm5.1 14.1c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1a13 13 0 0 1-5.9-5.2c-.6-1-.9-2-.9-2.7 0-.8.4-1.4.8-1.7.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c0 .2.1.4 0 .6l-.4.6-.4.5c-.1.1-.2.3-.1.5a9 9 0 0 0 1.8 2.2c.8.7 1.6 1 1.9 1.2.2.1.4.1.5-.1l.8-1c.2-.2.3-.2.6-.1l2 1c.3.1.4.2.5.3 0 .1 0 .5-.2 1Z" />
                  </svg>
                  WhatsApp
                </a>
              )}
            </div>
          </Reveal>
        )}

        {/* بصمة المنصة */}
        <Reveal delay={0.6}>
          <a
            href="https://www.dawati-dz.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-block font-body text-[11px] tracking-[0.18em] text-gold-dark/60 transition-colors hover:text-gold-dark"
          >
            Dawati · www.dawati-dz.com
          </a>
        </Reveal>
      </div>
    </section>
  );
}
