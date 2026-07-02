"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import WaxSeal from "./WaxSeal";

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

// Clip along the V creases of envelope-first1: the fold meets the side
// edges at ~19% and the tip sits under the gold seal (~49.3%). The seal is
// an HTML sprite (the baked one was inpainted out of the base asset).
const FLAP_CLIP = "polygon(0% 0%, 100% 0%, 100% 19%, 50% 49.3%, 0% 19%)";
// Same shape mirrored vertically, for the back face of the flap.
const FLAP_CLIP_BACK = "polygon(0% 100%, 100% 100%, 100% 81%, 50% 50.7%, 0% 81%)";

// Slightly inset so the painted interior never bleeds past the deckled
// envelope edge or the flap silhouette.
const INTERIOR_CLIP = "polygon(1.5% 1.5%, 98.5% 1.5%, 98.5% 19%, 50% 48.3%, 1.5% 19%)";

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

  const sealState = stage === "closed" ? "idle" : stage === "press" ? "press" : "crack";

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
        className="relative w-[min(96vw,500px)]"
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

          {/* envelope body — completely still, shown whole and uncropped */}
          <img
            src={data.assets.envelopeClosed}
            alt="Enveloppe scellée"
            className="relative z-0 w-full select-none"
            style={{ boxShadow: "0 24px 60px rgb(var(--color-burgundy-dark) / 0.2)" }}
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

          {/* the gold bismillah seal — compresses, cracks, then fades */}
          <div
            className="absolute z-40 w-[33%]"
            style={{ left: "50%", top: "49.32%", transform: "translate(-50%, -50%)" }}
          >
            <WaxSeal
              src={data.assets.envelopeSeal}
              initials={initials}
              state={sealState}
              onOpen={open}
              fontSize="clamp(1.3rem, 6.5vw, 2rem)"
              flat
            />
          </div>
        </motion.div>
      </motion.div>

      {/* no HTML tap hint: "Tap to Open" is part of the envelope artwork */}
    </motion.div>
  );
}
