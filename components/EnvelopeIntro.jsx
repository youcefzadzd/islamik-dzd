"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import WaxSeal from "./WaxSeal";
import { CornerOrnament, Rosette, CardFlourish, DividerOrnament } from "./ornaments";

/**
 * Clean full-screen envelope, opened like a real envelope:
 *  closed → four paper flaps (built from the clean paper texture — no
 *           baked seal recess, no halo) meet at the wax seal; an HTML
 *           "tap to open" line + ornament sit under the seal
 *  press  → the seal compresses (250ms) then cracks into shards
 *  flap   → the TOP flap folds up & back in 3D around the screen's top
 *           edge (900ms) — a real envelope opening
 *  reveal → the invitation mounts beneath and the overlay crossfades
 *           away immediately (no card, no paper coming out)
 *
 * Pieces are full-screen divs clipped into triangles meeting at CY, all
 * sharing the same texture/size so the seams are invisible; per-flap
 * tone gradients + clip-following drop-shadows give the layered look.
 */
const EASE = [0.22, 1, 0.36, 1];
// dev-only: slow the whole sequence down to inspect it (keep 1 in production)
const SLOW = 1;

const CY = "47%"; // tip point of the four flaps (and the seal centre)

const PAPER = "url(/assets/paper-texture.webp)";

const pieceBase = {
  backgroundImage: `linear-gradient(rgb(var(--color-ivory-light)), rgb(var(--color-ivory-light))), ${PAPER}`,
  backgroundBlendMode: "multiply",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

/* tone overlays: each flap catches the light slightly differently */
const TONES = {
  top: "linear-gradient(to bottom, rgb(var(--color-ivory-light) / 0.9), rgb(var(--color-ivory-dark) / 0.55))",
  left: "linear-gradient(105deg, rgb(var(--color-ivory) / 0.65), rgb(var(--color-ivory-dark) / 0.5))",
  right:
    "linear-gradient(255deg, rgb(var(--color-ivory) / 0.65), rgb(var(--color-ivory-dark) / 0.5))",
  bottom:
    "linear-gradient(to top, rgb(var(--color-ivory-light) / 0.85), rgb(var(--color-ivory) / 0.4))",
};

export default function EnvelopeIntro({ data, onMountMain, onDone }) {
  const [stage, setStage] = useState("closed");
  const [lang, setLang] = useState("fr");

  useEffect(() => {
    setLang(document.documentElement.lang === "ar" ? "ar" : "fr");
  }, []);

  const initials = `${data.couple.groomName.trim().charAt(0)} & ${data.couple.brideName
    .trim()
    .charAt(0)}`;

  const opening = stage !== "closed";

  function open() {
    if (stage !== "closed") return;
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12);
    setStage("press");
    // الغطاء يصعد ببطء (ثانيتان) والختم راكب عليه — ثم الصفحة مباشرة
    setTimeout(onMountMain, 1200 * SLOW);
    setTimeout(onDone, 2400 * SLOW);
  }

  const sealState = stage === "closed" ? "idle" : "press";

  const flapShadow = "drop-shadow(0 5px 14px rgb(var(--color-ink) / 0.13))";
  /* نقش مبروز: ظل علوي خافت + إضاءة سفلية — كالتذهيب المضغوط في الورق */
  const emboss = {
    filter:
      "drop-shadow(0 -0.5px 0.5px rgb(var(--color-ink) / 0.25)) drop-shadow(0 1px 0.5px rgb(255 255 255 / 0.85))",
  };

  return (
    <motion.div
      exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeOut" } }}
      className="fixed inset-0 z-50 overflow-hidden bg-ivory"
      style={{ perspective: 1200 }}
    >
      {/* الجيب السفلي + الجناحان — ثابتة، يكشفها انطواء الغطاء ثم تلاشي الطبقة */}
      {[
        { id: "bottom", clip: `polygon(0% 100%, 100% 100%, 50% ${CY})` },
        { id: "left", clip: `polygon(0% 0%, 50% ${CY}, 0% 100%)` },
        { id: "right", clip: `polygon(100% 0%, 50% ${CY}, 100% 100%)` },
      ].map((p) => (
        <div key={p.id} className="absolute inset-0" style={{ filter: flapShadow }}>
          <div className="absolute inset-0" style={{ ...pieceBase, clipPath: p.clip }}>
            <div className="absolute inset-0" style={{ background: TONES[p.id] }} />

            {/* زخارف مبروزة خاصة بكل قصاصة */}
            {p.id === "left" && (
              <div
                className="absolute bottom-[2.5%] left-[2.5%] w-[15vmin] max-w-[105px] opacity-55"
                style={{ ...emboss, transform: "scaleY(-1)" }}
              >
                <CornerOrnament className="w-full" />
              </div>
            )}
            {p.id === "right" && (
              <div
                className="absolute bottom-[2.5%] right-[2.5%] w-[15vmin] max-w-[105px] opacity-55"
                style={{ ...emboss, transform: "scale(-1,-1)" }}
              >
                <CornerOrnament className="w-full" />
              </div>
            )}
            {p.id === "bottom" && (
              <div
                className="absolute bottom-[3%] left-1/2 -translate-x-1/2 opacity-60"
                style={emboss}
              >
                <DividerOrnament className="h-[4.5vmin] w-[24vmin] max-w-[190px]" />
              </div>
            )}
          </div>
        </div>
      ))}

      {/* الغطاء العلوي — ينطوي للأعلى ببطء حول حافة الشاشة، والختم راكب
          على طرفه يصعد معه (الختم خارج قصاصة الورق فلا يُقتطع) */}
      <motion.div
        animate={
          opening
            ? {
                rotateX: 150,
                transition: { delay: 0.25 * SLOW, duration: 2.0 * SLOW, ease: "easeInOut" },
              }
            : { rotateX: 0 }
        }
        className="absolute inset-0 z-10"
        style={{
          transformOrigin: "50% 0%",
          transformStyle: "preserve-3d",
          filter: flapShadow,
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ ...pieceBase, clipPath: `polygon(0% 0%, 100% 0%, 50% ${CY})` }}
        >
          <div className="absolute inset-0" style={{ background: TONES.top }} />

          {/* زخارف الغطاء: زاويتان أرابيسك + وردة أندلسية وزهرية فوق الختم */}
          <div
            className="absolute left-[2.5%] top-[3%] w-[15vmin] max-w-[105px] opacity-55"
            style={emboss}
          >
            <CornerOrnament className="w-full" />
          </div>
          <div
            className="absolute right-[2.5%] top-[3%] w-[15vmin] max-w-[105px] opacity-55"
            style={{ ...emboss, transform: "scaleX(-1)" }}
          >
            <CornerOrnament className="w-full" />
          </div>
          <div
            className="absolute left-1/2 top-[6.5%] -translate-x-1/2 opacity-25"
            style={emboss}
          >
            <Rosette size="min(24vmin, 150px)" />
          </div>
          <div
            className="absolute left-1/2 top-[21%] -translate-x-1/2 opacity-65"
            style={emboss}
          >
            <CardFlourish className="h-[3.6vmin] w-[20vmin] max-w-[150px]" />
          </div>
        </div>

        {/* الختم الذهبي على طرف الغطاء — بلا هالة ولا ظل */}
        <div
          className="absolute z-30 w-[min(30vmin,170px)]"
          style={{ left: "50%", top: CY, transform: "translate(-50%, -50%)" }}
        >
          <WaxSeal
            src={data.assets.envelopeSeal}
            initials={initials}
            state={sealState}
            onOpen={open}
            fontSize="clamp(1.3rem, 5vmin, 2rem)"
            flat
            noShadow
          />
        </div>
      </motion.div>

      {/* نص الفتح + الزخرفة — HTML حقيقي (مترجم) يتلاشى عند النقر */}
      <motion.div
        animate={{ opacity: opening ? 0 : 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 text-center"
        style={{ top: `calc(${CY} + min(19vmin, 110px))` }}
      >
        <p
          className={`text-ink/60 ${lang === "ar" ? "font-arabicText" : "font-serif"}`}
          style={{ fontSize: "clamp(1.3rem, 4.6vmin, 2rem)", letterSpacing: "0.04em" }}
        >
          {lang === "ar" ? "اضغط لفتح الدعوة" : "Appuyez pour ouvrir"}
        </p>
        <div
          className="mx-auto mt-4 flex items-center gap-3 text-gold-dark/70"
          style={{ width: "min(46vmin, 260px)" }}
        >
          <span className="h-px flex-1 bg-gold/50" />
          <span style={{ fontSize: "1.1rem" }}>❖</span>
          <span className="h-px flex-1 bg-gold/50" />
        </div>
      </motion.div>

    </motion.div>
  );
}
