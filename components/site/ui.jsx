"use client";

/**
 * عناصر واجهة مشتركة للموقع التسويقي — منفصلة تمامًا عن مكوّنات الدعوات.
 */

import { motion } from "framer-motion";

/** ظهور ناعم عند التمرير */
export function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** سطر تمهيدي صغير فوق العنوان */
export function Kicker({ children }) {
  return (
    <div className="flex items-center justify-center gap-3 text-gold-dark">
      <span className="h-px w-8 bg-gold/60" />
      <span className="text-[0.72rem] font-semibold uppercase tracking-[0.28em]">
        {children}
      </span>
      <span className="h-px w-8 bg-gold/60" />
    </div>
  );
}

/** رأس قسم: تمهيد + عنوان + وصف */
export function SectionHead({ kicker, title, subtitle, lang }) {
  const arabic = lang === "ar";
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <Kicker>{kicker}</Kicker>
      <h2
        className={`mt-4 text-3xl leading-snug text-burgundy-dark sm:text-4xl ${
          arabic ? "font-arabicText font-bold" : "font-serif font-semibold"
        }`}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={`mt-4 text-base leading-relaxed text-ink/65 sm:text-lg ${
            arabic ? "font-arabicText" : "font-body"
          }`}
        >
          {subtitle}
        </p>
      ) : null}
    </Reveal>
  );
}

/** زر رئيسي ذهبي/بورجوندي */
export function PrimaryButton({ href, onClick, children, className = "", newTab }) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full bg-burgundy px-7 py-3 text-sm font-semibold text-cream shadow-[0_12px_30px_-10px_rgb(var(--color-burgundy)/0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-burgundy-dark hover:shadow-[0_16px_36px_-10px_rgb(var(--color-burgundy)/0.6)] ${className}`;
  if (href) {
    return (
      <a
        href={href}
        className={cls}
        {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

/** زر ثانوي بإطار ذهبي */
export function GhostButton({ href, onClick, children, className = "", newTab }) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full border border-gold/50 bg-cream/60 px-7 py-3 text-sm font-semibold text-burgundy-dark backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:bg-cream ${className}`;
  if (href) {
    return (
      <a
        href={href}
        className={cls}
        {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

/** أيقونة واتساب */
export function WhatsAppIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91A9.86 9.86 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 8.24 8.25c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

/** علامة صح ذهبية لقوائم المزايا */
export function CheckIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden>
      <circle cx="10" cy="10" r="9" className="fill-gold/15" />
      <path
        d="M6 10.2l2.6 2.6L14 7.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** فاصل زخرفي ذهبي بسيط */
export function Flourish() {
  return (
    <div className="flex items-center justify-center gap-2 text-gold" aria-hidden>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold/60" />
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
        <path d="M12 2c.6 3.4 2.2 5.7 4.5 7-2.3 1.3-3.9 3.6-4.5 7-.6-3.4-2.2-5.7-4.5-7C9.8 7.7 11.4 5.4 12 2Z" />
      </svg>
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold/60" />
    </div>
  );
}
