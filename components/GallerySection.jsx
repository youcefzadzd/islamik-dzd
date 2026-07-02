"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "./Reveal";
import SectionPanel from "./SectionPanel";

export default function GallerySection({ data }) {
  const gallery = data.gallery;
  const [selected, setSelected] = useState(null);

  return (
    <SectionPanel>
      <div className="text-center">
        <Reveal>
          <h2 className="font-monogram text-4xl text-gold-dark sm:text-5xl">{gallery.heading}</h2>
          <p className="mt-3 font-body text-lg text-ink/75">{gallery.subheading}</p>
          <div className="divider mt-4">
            <span className="text-gold">✦</span>
          </div>
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-3">
          {gallery.images.map((image, index) => (
            <Reveal
              key={image.src}
              delay={index * 0.1}
              className={index === 0 ? "col-span-2" : ""}
            >
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelected(image)}
                className="lux-media block w-full"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className={`lux-grade w-full object-cover transition-transform duration-700 hover:scale-105 ${
                    index === 0 ? "aspect-[16/10]" : "aspect-square"
                  }`}
                />
              </motion.button>
            </Reveal>
          ))}
        </div>
      </div>

      {/* lightbox */}
      <AnimatePresence>
        {selected ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selected.src}
              alt={selected.alt}
              className="lux-grade max-h-[85vh] w-auto max-w-full rounded-[22px] shadow-2xl"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </SectionPanel>
  );
}
