"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Reveal from "./Reveal";
import SectionPanel from "./SectionPanel";

const EASE = [0.22, 1, 0.36, 1];
const GOLD_BORDER = "1px solid #D4B06A";

export default function GallerySection({ data }) {
  const gallery = data.gallery;
  const images = gallery.images;
  const reduce = useReducedMotion();
  // index of the opened image, or null when the lightbox is closed
  const [selected, setSelected] = useState(null);
  const touchStartX = useRef(null);

  const next = useCallback(
    () => setSelected((i) => (i === null ? i : (i + 1) % images.length)),
    [images.length]
  );
  const prev = useCallback(
    () => setSelected((i) => (i === null ? i : (i - 1 + images.length) % images.length)),
    [images.length]
  );

  // keyboard navigation while the lightbox is open
  useEffect(() => {
    if (selected === null) return;
    function onKey(e) {
      if (e.key === "Escape") setSelected(null);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, next, prev]);

  return (
    <SectionPanel>
      <div className="text-center">
        <Reveal>
          <h2 className="font-monogram text-4xl text-gold-dark sm:text-5xl">{gallery.heading}</h2>
          <p className="mt-3 font-body text-lg text-ink/75">{gallery.subheading}</p>
          <div className="divider mt-5">
            <span className="text-gold">✦</span>
          </div>
        </Reveal>

        {/* 2x2 grid of the collection */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4">
          {images.map((image, index) => (
            <motion.button
              key={image.src}
              type="button"
              onClick={() => setSelected(index)}
              initial={reduce ? false : { opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.7, delay: index * 0.12, ease: EASE }}
              whileHover={
                reduce
                  ? undefined
                  : {
                      scale: 1.03,
                      boxShadow:
                        "12px 18px 34px rgb(90 70 54 / 0.24), 0 0 26px rgb(212 176 106 / 0.45)",
                    }
              }
              whileTap={{ scale: 0.98 }}
              className="block w-full overflow-hidden"
              style={{
                borderRadius: 24,
                border: GOLD_BORDER,
                boxShadow: "10px 14px 26px rgb(90 70 54 / 0.14)",
                transitionDuration: "0.5s",
              }}
            >
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="lux-grade aspect-square w-full object-cover"
                draggable={false}
              />
            </motion.button>
          ))}
        </div>
      </div>

      {/* fullscreen lightbox: blurred dark backdrop, zoom, swipe and arrows */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgb(30 22 16 / 0.82)", backdropFilter: "blur(10px)" }}
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchStartX.current;
              touchStartX.current = null;
              if (dx < -50) next();
              else if (dx > 50) prev();
            }}
          >
            {/* close */}
            <button
              type="button"
              aria-label="Fermer"
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border text-xl text-ivory-light"
              style={{ borderColor: "#D4B06A", background: "rgb(30 22 16 / 0.5)" }}
            >
              ✕
            </button>

            {/* desktop arrows */}
            <button
              type="button"
              aria-label="Précédente"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-3 z-10 hidden h-11 w-11 items-center justify-center rounded-full border text-xl text-ivory-light sm:flex"
              style={{ borderColor: "#D4B06A", background: "rgb(30 22 16 / 0.5)" }}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Suivante"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-3 z-10 hidden h-11 w-11 items-center justify-center rounded-full border text-xl text-ivory-light sm:flex"
              style={{ borderColor: "#D4B06A", background: "rgb(30 22 16 / 0.5)" }}
            >
              ›
            </button>

            <AnimatePresence mode="popLayout">
              <motion.img
                key={selected}
                initial={{ opacity: 0, scale: reduce ? 1 : 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: reduce ? 1 : 0.94 }}
                transition={{ duration: 0.4, ease: EASE }}
                src={images[selected].src}
                alt={images[selected].alt}
                onClick={(e) => e.stopPropagation()}
                className="lux-grade max-h-[85vh] w-auto max-w-full select-none"
                style={{ borderRadius: 24, border: GOLD_BORDER }}
                draggable={false}
              />
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionPanel>
  );
}
