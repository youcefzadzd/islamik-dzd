"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/**
 * Cinematic opening:
 *  closed    → envelope at rest (soft float + warm sheen on hover)
 *  press     → the seal compresses and gives a tiny realistic shake (250ms)
 *  sealfade  → the monogram seal fades out smoothly (250ms)
 *  flap      → the top flap folds back in real 3D around the fold line (900ms)
 *  pause     → the open envelope settles (200ms)
 *  done      → overlay crossfades into the hero (500ms)
 *
 * The flap is the envelope image itself, clipped along the crease lines and
 * around the wax seal (real wax stays on the flap), rotating on the X axis
 * with perspective(1200px). Under it, a painted paper interior + shadows.
 */
const EASE = [0.22, 1, 0.36, 1];
// dev-only: slow the whole sequence down to inspect it (keep 1 in production)
const SLOW = 1;

// Clip along the V creases: top corners down to the flap tip. The wax seal
// is HTML-only (the baked one was inpainted out of the asset), so the flap
// is a clean paper triangle.
const FLAP_CLIP = "polygon(0% 0%, 100% 0%, 50% 47.7%)";
// Same shape mirrored vertically, for the back face of the flap.
const FLAP_CLIP_BACK = "polygon(0% 100%, 100% 100%, 50% 52.3%)";

// Slightly inset so the painted interior never bleeds past the deckled
// envelope edge or the flap silhouette.
const INTERIOR_CLIP = "polygon(2% 1.5%, 98% 1.5%, 50% 46.5%)";

const INTERIOR_STYLE = {
  clipPath: INTERIOR_CLIP,
  backgroundImage:
    "linear-gradient(to bottom, rgb(var(--color-ivory-dark)) 0%, rgb(var(--color-ivory)) 60%), url(/assets/paper-texture.webp)",
  backgroundBlendMode: "multiply",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

export default function EnvelopeIntro({ data, onMountMain, onDone }) {
  const [stage, setStage] = useState("closed");
  const [hovered, setHovered] = useState(false);

  const initials = `${data.couple.groomName.trim().charAt(0)} & ${data.couple.brideName
    .trim()
    .charAt(0)}`;

  const opening = stage === "flap" || stage === "pause";

  function open() {
    if (stage !== "closed") return;
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12);
    setStage("press");
    setTimeout(() => setStage("sealfade"), 250 * SLOW);
    setTimeout(() => {
      setStage("flap");
      onMountMain();
    }, 500 * SLOW);
    setTimeout(() => setStage("pause"), 1400 * SLOW);
    setTimeout(onDone, 1600 * SLOW);
  }

  const sealAnimate =
    stage === "closed"
      ? { scale: 1, opacity: 1, rotate: 0 }
      : stage === "press"
        ? {
            scale: [1, 0.94, 0.97, 0.95],
            rotate: [0, -1, 1, -0.5],
            x: [0, -1, 1, 0],
            transition: { duration: 0.25, ease: "easeOut" },
          }
        : { opacity: 0, scale: 1.03, transition: { duration: 0.25, ease: "easeOut" } };

  // real paper: fast take-off, long elegant settle, with a faint mid-flight bend
  const flapAnimate = opening
    ? {
        rotateX: -158,
        scaleY: [1, 0.985, 1],
        transition: {
          rotateX: { duration: 0.9 * SLOW, ease: EASE },
          scaleY: { duration: 0.9 * SLOW, times: [0, 0.45, 1], ease: "easeInOut" },
        },
      }
    : { rotateX: 0 };

  // subtle camera: gentle push-in while the flap opens
  const cameraAnimate = opening
    ? { scale: 1.03, transition: { duration: 0.9, ease: EASE } }
    : stage === "closed" && hovered
      ? { y: [-1, -3, -1], transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut" } }
      : { scale: 1, y: 0 };

  return (
    <motion.div
      exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeOut" } }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-ivory"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 50% 35%, rgb(var(--color-ivory-light)) 0%, rgb(var(--color-ivory)) 55%, rgb(var(--color-ivory-dark)) 100%)",
      }}
    >
      {/* soft gold glow behind the envelope */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgb(var(--color-gold-light) / 0.5), transparent 65%)" }}
      />

      {/* cinematic vignette, breathes in while the envelope opens */}
      <motion.div
        aria-hidden
        animate={{ opacity: opening ? 0.28 : 0 }}
        transition={{ duration: 0.9, ease: EASE }}
        className="pointer-events-none absolute inset-0 z-40"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgb(var(--color-burgundy-dark) / 0.55) 130%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE }}
        className="relative w-[min(94vw,460px)]"
      >
        <motion.div
          animate={cameraAnimate}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          onClick={open}
          className="relative cursor-pointer"
          style={{ perspective: 1200 }}
        >
          {/* resting / hover shadow under the whole envelope */}
          <motion.div
            aria-hidden
            animate={{
              opacity: hovered && stage === "closed" ? 0.5 : 0.32,
              scale: hovered && stage === "closed" ? 1.04 : 1,
            }}
            transition={{ duration: 0.5, ease: EASE }}
            className="absolute left-1/2 top-[96%] h-[12%] w-[86%] -translate-x-1/2 rounded-[50%] blur-xl"
            style={{ background: "rgb(var(--color-burgundy-dark) / 0.55)" }}
          />

          {/* envelope body — completely still */}
          <img
            src={data.assets.envelopeClosed}
            alt="Enveloppe scellée"
            className="relative z-0 w-full select-none"
            draggable={false}
          />

          {/* paper interior, revealed as the flap lifts */}
          <motion.div
            aria-hidden
            animate={{ opacity: opening ? 1 : 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute inset-0 z-10"
            style={INTERIOR_STYLE}
          >
            {/* pocket shadow just under the fold line */}
            <motion.div
              animate={{ opacity: opening ? 1 : 0 }}
              transition={{ duration: 0.9, ease: EASE }}
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgb(var(--color-ink) / 0.38), rgb(var(--color-ink) / 0.1) 26%, transparent 55%)",
              }}
            />
          </motion.div>

          {/* dynamic shadow the flap casts on the body while lifting */}
          <motion.div
            aria-hidden
            animate={
              opening
                ? {
                    opacity: [0, 0.32, 0],
                    scaleY: [1, 0.55, 0.12],
                    transition: { duration: 0.9, times: [0, 0.35, 1], ease: EASE },
                  }
                : { opacity: 0, scaleY: 1 }
            }
            className="absolute inset-0 z-10 origin-top"
            style={{
              clipPath: FLAP_CLIP,
              background:
                "linear-gradient(to bottom, transparent 45%, rgb(var(--color-ink) / 0.5) 98%)",
              filter: "blur(3px)",
            }}
          />

          {/* the top flap — rotates in 3D around the fold line */}
          <motion.div
            aria-hidden
            animate={flapAnimate}
            className="absolute inset-0 z-30"
            style={{
              transformOrigin: "50% 0%",
              transformStyle: "preserve-3d",
              transformPerspective: 1200,
              filter: opening
                ? "drop-shadow(0 6px 10px rgb(var(--color-ink) / 0.3))"
                : "none",
            }}
          >
            {/* front: the real envelope flap, wax seal riding along */}
            <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
              <img
                src={data.assets.envelopeClosed}
                alt=""
                className="h-full w-full select-none"
                style={{ clipPath: FLAP_CLIP }}
                draggable={false}
              />
              {/* light sweeping across the paper while it bends open */}
              <motion.div
                animate={{ opacity: opening ? [0, 0.5, 0] : 0 }}
                transition={{ duration: 0.9, times: [0, 0.4, 1], ease: "easeInOut" }}
                className="absolute inset-0"
                style={{
                  clipPath: FLAP_CLIP,
                  background:
                    "linear-gradient(to bottom, rgb(var(--color-ivory-light) / 0.1) 0%, rgb(var(--color-gold-light) / 0.45) 34%, transparent 62%)",
                }}
              />
              {/* crisp highlight on the deckled crease edges */}
              <motion.div
                animate={{ opacity: opening ? 0.8 : 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="absolute inset-0"
                style={{
                  clipPath: FLAP_CLIP,
                  boxShadow: "inset 0 -2px 3px rgb(var(--color-ivory-light) / 0.9)",
                }}
              />
            </div>
            {/* back: the inside of the flap, plain warm paper */}
            <div
              className="absolute inset-0"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateX(180deg)",
                clipPath: FLAP_CLIP_BACK,
                backgroundImage:
                  "linear-gradient(to top, rgb(var(--color-ivory-dark)) 0%, rgb(var(--color-ivory-light)) 70%), url(/assets/paper-texture.webp)",
                backgroundBlendMode: "multiply",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </motion.div>

          {/* warm light reflection on hover */}
          <motion.div
            aria-hidden
            animate={{ opacity: hovered && stage === "closed" ? 0.5 : 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="pointer-events-none absolute inset-0 z-30"
            style={{
              background:
                "radial-gradient(ellipse at 30% 12%, rgb(var(--color-gold-light) / 0.55), transparent 55%)",
              mixBlendMode: "soft-light",
            }}
          />

          {/* monogram wax seal — compresses, shakes, then fades */}
          <div
            className="absolute z-40 w-[29%]"
            style={{ left: "50%", top: "47.5%", transform: "translate(-50%, -50%)" }}
          >
            <motion.button
              type="button"
              aria-label="Ouvrir l'invitation"
              animate={sealAnimate}
              whileHover={stage === "closed" ? { scale: 1.04 } : undefined}
              whileTap={stage === "closed" ? { scale: 0.94 } : undefined}
              onClick={open}
              className="relative w-full outline-none"
            >
              <img src={data.assets.waxSeal} alt="" className="w-full select-none" draggable={false} />
              <span
                className="absolute inset-0 flex items-center justify-center pb-[6%] font-monogram text-gold-light"
                style={{
                  fontSize: "clamp(1.3rem, 6.5vw, 2rem)",
                  textShadow:
                    "0 1px 1px rgb(var(--color-burgundy-dark)), 0 -1px 1px rgb(var(--color-burgundy-light) / 0.6)",
                }}
              >
                {initials}
              </span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      {/* tap to open hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: stage === "closed" ? 1 : 0 }}
        transition={{ duration: 0.6, delay: stage === "closed" ? 0.9 : 0 }}
        className="absolute bottom-[8svh] flex flex-col items-center gap-1 text-gold-dark"
      >
        <motion.span
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="text-lg"
          aria-hidden
        >
          ⌃
        </motion.span>
        <span className="text-[0.7rem] uppercase tracking-[0.45em]">{data.envelope.tapToOpenText}</span>
      </motion.div>
    </motion.div>
  );
}
