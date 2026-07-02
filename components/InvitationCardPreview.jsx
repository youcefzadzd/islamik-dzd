import CornerFlourish from "./ornaments/CornerFlourish";
import EightPointStar from "./ornaments/EightPointStar";

/**
 * The card that rises out of the envelope during the opening animation.
 * Visually inspired by invitation-card.png (bordered frame, corner
 * flourishes) but built entirely with HTML/CSS so every field is real,
 * dynamic content from data/invitationData.js — not a baked-in image.
 */
export default function InvitationCardPreview({ data }) {
  const { couple, event, location, invitationMessage, signature } = data;
  const names =
    couple.order?.[0] === "bride"
      ? [couple.brideNameFr, couple.groomNameFr]
      : [couple.groomNameFr, couple.brideNameFr];

  return (
    <div
      className="relative w-full h-full rounded-md overflow-hidden flex flex-col items-center justify-center text-center px-5 py-6"
      style={{
        backgroundImage: "url(/assets/paper-texture.webp)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow: "0 20px 40px -12px rgb(var(--color-ink) / 0.35)",
      }}
    >
      <div className="absolute inset-3 border border-gold/50 rounded-sm pointer-events-none" />
      <CornerFlourish className="absolute top-2 left-2 w-8 h-8 text-gold/70" />
      <CornerFlourish className="absolute top-2 right-2 w-8 h-8 text-gold/70" flipX />
      <CornerFlourish className="absolute bottom-2 left-2 w-8 h-8 text-gold/70" flipY />
      <CornerFlourish className="absolute bottom-2 right-2 w-8 h-8 text-gold/70" flipX flipY />

      <span className="text-gold mb-3">
        <EightPointStar size={16} />
      </span>

      <p className="font-serif text-xl sm:text-2xl text-emerald leading-tight text-balance">
        {names[0]} <span className="text-gold">&amp;</span> {names[1]}
      </p>

      <p className="mt-3 font-body text-sm text-ink/80">
        {event.displayDay} {event.displayDate} · {event.displayTime}
      </p>

      <p className="mt-1 font-body text-sm text-ink/70">
        {location.venueName} — {location.address}
      </p>

      <div className="mt-4 space-y-1 max-w-[85%]">
        {invitationMessage.lines.map((line, i) => (
          <p key={i} className="font-body italic text-xs sm:text-sm text-ink/70 leading-snug">
            {line}
          </p>
        ))}
      </div>

      <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-gold-dark">
        {signature.groomFamilyLabel} · {signature.brideFamilyLabel}
      </p>
    </div>
  );
}
