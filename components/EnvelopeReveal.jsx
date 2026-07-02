"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import InvitationCardPreview from "./InvitationCardPreview";

const STAGES = ["idle", "seal", "open", "card"];

function initialOf(name) {
  return name?.trim()?.charAt(0)?.toUpperCase() ?? "";
}

function useMonogram(couple) {
  return useMemo(() => {
    const brideFirst = couple.order?.[0] === "bride";
    const first = brideFirst ? couple.brideNameFr : couple.groomNameFr;
    const second = brideFirst ? couple.groomNameFr : couple.brideNameFr;
    return `${initialOf(first)} & ${initialOf(second)}`;
  }, [couple]);
}

/**
 * The opening scene, built from the real envelope/seal artwork in
 * public/assets/. Tap or touch anywhere to begin: the wax seal (with a
 * live monogram label above it) lifts away, the closed envelope
 * crossfades to the opened one, and a dynamic HTML/CSS invitation card
 * rises in — then the whole scene dissolves into the invitation itself.
 */
export default function EnvelopeReveal({ data, onOpen }) {
  const [stage, setStage] = useState("idle");
  const [closing, setClosing] = useState(false);
  const [ripple, setRipple] = useState(null);
  const monogram = useMonogram(data.couple);
  const stageIndex = STAGES.indexOf(stage);

  function handleActivate(e) {
    if (stage !== "idle") return;

    if (e?.clientX !== undefined) {
      const rect = e.currentTarget.getBoundingClientRect();
      setRipple({ id: Date.now(), x: e.clientX - rect.left, y: e.clientY - rect.top });
    }

    setStage("seal");
    setTimeout(() => setStage("open"), 800);
    setTimeout(() => setStage("card"), 800 + 900);
    setTimeout(() => setClosing(true), 800 + 900 + 2000);
  }

  return (
    <AnimatePresence onExitComplete={onOpen}>
      {!closing && (
        <motion.div
          key="envelope-reveal"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-hidden"
          style={{
            backgroundImage: "url(/assets/paper-texture.webp)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* soft ivory wash keeps the texture photo's dark vignette off-screen */}
          <div className="absolute inset-0" style={{ background: "rgb(var(--color-ivory) / 0.55)" }} />

          <motion.div
            role="button"
            tabIndex={0}
            aria-label="Ouvrir l'invitation"
            onClick={handleActivate}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleActivate()}
            animate={stage === "idle" ? { scale: [1, 1.012, 1] } : { scale: 1 }}
            transition={{ duration: 5, repeat: stage === "idle" ? Infinity : 0, ease: "easeInOut" }}
            className="relative z-10 cursor-pointer select-none w-full"
            style={{ maxWidth: 380 }}
          >
            {/* ambient glow, only while waiting to be touched */}
            <motion.div
              className="absolute -inset-10 rounded-[3rem] pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at center, rgb(var(--color-gold) / 0.16), transparent 70%)",
              }}
              animate={stage === "idle" ? { opacity: [0.3, 0.65, 0.3] } : { opacity: 0 }}
              transition={{ duration: 4, repeat: stage === "idle" ? Infinity : 0, ease: "easeInOut" }}
            />

            {/* touch ripple indicator */}
            <AnimatePresence>
              {ripple && (
                <motion.span
                  key={ripple.id}
                  className="absolute rounded-full pointer-events-none z-40"
                  style={{
                    left: ripple.x,
                    top: ripple.y,
                    x: "-50%",
                    y: "-50%",
                    background: "radial-gradient(circle, rgb(var(--color-gold) / 0.4), transparent 72%)",
                  }}
                  initial={{ width: 0, height: 0, opacity: 0.7 }}
                  animate={{ width: 160, height: 160, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  onAnimationComplete={() => setRipple(null)}
                />
              )}
            </AnimatePresence>

            <div className="relative aspect-[1086/1448]">
              {/* Closed envelope */}
              <motion.div
                className="absolute inset-0"
                animate={{ opacity: stageIndex >= 2 ? 0 : 1 }}
                transition={{ duration: 0.9, ease: "easeInOut" }}
              >
                <Image
                  src="/assets/envelope-closed.webp"
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 480px) 90vw, 380px"
                  className="object-contain drop-shadow-[0_25px_45px_rgba(32,40,31,0.35)]"
                />
              </motion.div>

              {/* Opened envelope, crossfades in — cropped to the pocket/vine
                  area so the sample monogram printed on the flap never shows */}
              <motion.div
                className="absolute inset-0 rounded-md overflow-hidden"
                animate={{ opacity: stageIndex >= 2 ? 1 : 0 }}
                transition={{ duration: 0.9, ease: "easeInOut" }}
              >
                <Image
                  src="/assets/envelope-open.webp"
                  alt=""
                  fill
                  sizes="(max-width: 480px) 90vw, 380px"
                  className="object-cover drop-shadow-[0_25px_45px_rgba(32,40,31,0.35)]"
                  style={{ objectPosition: "center 82%" }}
                />
              </motion.div>

              {/* Invitation card, rises in once the envelope has opened */}
              <motion.div
                className="absolute inset-0 z-10"
                animate={
                  stageIndex >= 3
                    ? { opacity: 1, y: 0, scale: 1 }
                    : { opacity: 0, y: 24, scale: 0.96 }
                }
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                <InvitationCardPreview data={data} />
              </motion.div>

              {/* Wax seal, centered, detaches first — live initials above it */}
              <motion.div
                className="absolute z-30 flex flex-col items-center gap-1.5"
                style={{
                  left: "50%",
                  top: "54%",
                  x: "-50%",
                  y: "-50%",
                  width: "30%",
                }}
                animate={
                  stageIndex >= 1
                    ? { y: "-230%", scale: 0.6, rotate: -20, opacity: 0 }
                    : { y: "-50%", scale: 1, rotate: 0, opacity: 1 }
                }
                transition={{ duration: 0.8, ease: [0.34, 1.15, 0.4, 1] }}
              >
                <span
                  className="font-monogram text-gold-dark"
                  style={{
                    fontSize: "clamp(14px, 4.6vw, 22px)",
                    textShadow: "0 1px 2px rgba(255,255,255,0.7)",
                  }}
                >
                  {monogram}
                </span>
                <div
                  className="relative w-full rounded-full overflow-hidden"
                  style={{
                    aspectRatio: "1 / 1",
                    backgroundImage: "url(/assets/wax-seal.webp)",
                    backgroundSize: "210%",
                    backgroundPosition: "50% 44%",
                    boxShadow: "0 10px 20px -6px rgba(0,0,0,0.45)",
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
