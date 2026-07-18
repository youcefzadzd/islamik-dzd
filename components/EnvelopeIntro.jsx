"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import WaxSeal from "./WaxSeal";

/**
 * Full-screen opening (immersive, like high-end Tilda invitations):
 *  closed   → the envelope artwork fills the ENTIRE viewport (object-cover),
 *             wax seal at its centre, soft float on hover
 *  press    → the seal compresses with a tiny realistic shake (250ms)
 *  sealfade → the seal cracks and fades (300ms)
 *  reveal   → the whole envelope dissolves into the hero: gentle scale-up
 *             while the overlay crossfades away (parent exit, 500ms)
 *
 * The previous 3D flap-fold sequence lives in git history (7ba7b94 /
 * revert 3bcec10) if it's ever wanted again.
 */
const EASE = [0.22, 1, 0.36, 1];
// dev-only: slow the whole sequence down to inspect it (keep 1 in production)
const SLOW = 1;

export default function EnvelopeIntro({ data, onMountMain, onDone }) {
  const [stage, setStage] = useState("closed");
  const [hovered, setHovered] = useState(false);

  const initials = `${data.couple.groomName.trim().charAt(0)} & ${data.couple.brideName
    .trim()
    .charAt(0)}`;

  const revealing = stage === "reveal";

  function open() {
    if (stage !== "closed") return;
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12);
    setStage("press");
    setTimeout(() => setStage("sealfade"), 250 * SLOW);
    setTimeout(() => {
      setStage("reveal");
      onMountMain();
    }, 550 * SLOW);
    setTimeout(onDone, 900 * SLOW);
  }

  const sealState = stage === "closed" ? "idle" : stage === "press" ? "press" : "crack";

  return (
    <motion.div
      exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeOut" } }}
      className="fixed inset-0 z-50 overflow-hidden bg-ivory"
    >
      {/* the envelope fills the whole screen — an immersive giant envelope */}
      <motion.div
        initial={{ opacity: 0, scale: 1.04 }}
        animate={
          revealing
            ? { opacity: 1, scale: 1.1, transition: { duration: 0.6, ease: EASE } }
            : stage === "closed" && hovered
              ? {
                  opacity: 1,
                  scale: [1.0, 1.008, 1.0],
                  transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                }
              : { opacity: 1, scale: 1, transition: { duration: 1.1, ease: EASE } }
        }
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className="absolute inset-0"
      >
        <img
          src={data.assets.envelopeClosed}
          alt="Enveloppe scellée"
          draggable={false}
          className="h-full w-full select-none object-cover"
        />

        {/* soft warm light breathing over the paper */}
        <motion.div
          aria-hidden
          animate={{ opacity: hovered && stage === "closed" ? 0.45 : 0.22 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 38%, rgb(var(--color-gold-light) / 0.5), transparent 60%)",
            mixBlendMode: "soft-light",
          }}
        />

        {/* cinematic vignette that deepens as the envelope dissolves */}
        <motion.div
          aria-hidden
          animate={{ opacity: revealing ? 0.35 : 0.14 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 50%, rgb(var(--color-burgundy-dark) / 0.5) 135%)",
          }}
        />
      </motion.div>

      {/* the gold bismillah seal — at the centre of the giant envelope.
          49.3% matches the baked seal recess of the square artwork, which
          object-cover keeps at (or within ~1% of) the viewport centre. */}
      <div
        className="absolute z-40 w-[min(34vmin,190px)]"
        style={{ left: "50%", top: "49.3%", transform: "translate(-50%, -50%)" }}
      >
        <WaxSeal
          src={data.assets.envelopeSeal}
          initials={initials}
          state={sealState}
          onOpen={open}
          fontSize="clamp(1.3rem, 5vmin, 2rem)"
          flat
        />
      </div>
    </motion.div>
  );
}
