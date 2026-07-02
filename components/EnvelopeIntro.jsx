"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/**
 * Opening experience:
 *  closed  → envelope + wax seal (dynamic initials) fill the screen
 *  shake   → the seal trembles under the finger
 *  fly     → the seal breaks off and flies away
 *  paper   → the invitation paper slides out of the envelope
 *  expand  → the paper grows and melts into the hero page
 */
const EASE = [0.22, 1, 0.36, 1];

export default function EnvelopeIntro({ data, onMountMain, onDone }) {
  const [stage, setStage] = useState("closed");

  const initials = `${data.couple.groomName.trim().charAt(0)} & ${data.couple.brideName
    .trim()
    .charAt(0)}`;

  function open() {
    if (stage !== "closed") return;
    setStage("shake");
    setTimeout(() => setStage("fly"), 550);
    setTimeout(() => setStage("paper"), 1000);
    setTimeout(() => {
      setStage("expand");
      onMountMain();
    }, 2150);
    setTimeout(onDone, 3050);
  }

  const sealAnimate =
    stage === "closed"
      ? { y: 0, opacity: 1 }
      : stage === "shake"
        ? { rotate: [0, -7, 7, -5, 5, -2, 0], transition: { duration: 0.55 } }
        : { y: -220, x: 70, rotate: 28, scale: 1.15, opacity: 0, transition: { duration: 0.65, ease: "easeIn" } };

  const paperAnimate =
    stage === "paper"
      ? { opacity: 1, y: "-72%", scale: 1, transition: { duration: 1.05, ease: EASE } }
      : stage === "expand"
        ? { opacity: 1, y: "-42%", scale: 3.4, transition: { duration: 0.95, ease: [0.4, 0, 0.2, 1] } }
        : { opacity: 0, y: "0%", scale: 0.92 };

  const envelopeAnimate =
    stage === "expand"
      ? { y: 70, scale: 1.05, opacity: 0, transition: { duration: 0.7, ease: "easeIn" } }
      : stage === "paper"
        ? { scale: 1.02, transition: { duration: 0.8, ease: EASE } }
        : { scale: 1, opacity: 1 };

  return (
    <motion.div
      exit={{ opacity: 0, transition: { duration: 0.7, ease: "easeOut" } }}
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

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE }}
        className="relative w-[min(94vw,460px)]"
      >
        {/* invitation paper — slides out from inside the envelope.
            Centering lives on this wrapper so framer-motion's transform
            on the img never overrides it. */}
        <div
          className={`absolute left-1/2 top-1/2 w-[55%] ${stage === "expand" ? "z-30" : "z-0"}`}
          style={{ transform: "translate(-50%, -50%)" }}
        >
          <motion.img
            src={data.assets.invitationPaper}
            alt=""
            animate={paperAnimate}
            className="w-full drop-shadow-2xl"
            draggable={false}
          />
        </div>

        {/* the closed envelope */}
        <motion.div animate={envelopeAnimate} className="relative z-10 cursor-pointer" onClick={open}>
          <img
            src={data.assets.envelopeClosed}
            alt="Enveloppe scellée"
            className="w-full select-none drop-shadow-[0_30px_50px_rgb(var(--color-burgundy-dark)/0.25)]"
            draggable={false}
          />

          {/* wax seal + dynamic initials, centered over the envelope's own seal */}
          <div
            className="absolute z-20 w-[29%]"
            style={{ left: "50%", top: "47.5%", transform: "translate(-50%, -50%)" }}
          >
            <motion.button
              type="button"
              aria-label="Ouvrir l'invitation"
              animate={sealAnimate}
              whileHover={stage === "closed" ? { scale: 1.05 } : undefined}
              whileTap={stage === "closed" ? { scale: 0.93 } : undefined}
              onClick={open}
              className="relative w-full outline-none"
            >
              <img src={data.assets.waxSeal} alt="" className="w-full select-none" draggable={false} />
              <span
                className="absolute inset-0 flex items-center justify-center pb-[6%] font-monogram text-gold-light"
                style={{
                  fontSize: "clamp(1.3rem, 6.5vw, 2rem)",
                  textShadow: "0 1px 1px rgb(var(--color-burgundy-dark)), 0 -1px 1px rgb(var(--color-burgundy-light) / 0.6)",
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
