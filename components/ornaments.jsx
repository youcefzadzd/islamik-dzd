"use client";

/**
 * The shared hand-drawn ornament set of the invitation collection.
 * Pure SVG — every section uses the same gold and the same strokes.
 */

/* arabesque corner scrollwork with a small burgundy accent */
export function CornerOrnament({ className }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden className={className}>
      <path
        d="M4 116 C4 70 16 34 44 18 C66 6 92 4 116 4"
        stroke="#C6A15B"
        strokeWidth="1.4"
        opacity="0.85"
      />
      <path
        d="M14 116 C14 78 25 44 50 28 C69 16 92 14 116 14"
        stroke="#C6A15B"
        strokeWidth="0.9"
        opacity="0.55"
      />
      <path
        d="M24 100 C26 76 36 56 56 44 C50 58 48 74 52 88 C42 84 30 90 24 100 Z"
        stroke="#C6A15B"
        strokeWidth="1"
        opacity="0.7"
      />
      <path
        d="M60 40 C70 30 84 26 96 28 C88 34 84 42 86 52 C76 50 66 44 60 40 Z"
        stroke="#C6A15B"
        strokeWidth="1"
        opacity="0.7"
      />
      <circle cx="52" cy="88" r="2.4" stroke="#C6A15B" strokeWidth="1" opacity="0.7" />
      <circle cx="86" cy="52" r="2.4" stroke="#C6A15B" strokeWidth="1" opacity="0.7" />
      <path d="M0 0 L26 0 C14 4 6 12 2 24 L0 26 Z" fill="#7B1E2B" opacity="0.85" />
      <path d="M6 6 L18 3 C11 7 8 11 5 18 Z" fill="#D8BD7A" opacity="0.5" />
    </svg>
  );
}

/* faint Andalusian eight-point rosette watermark */
export function Rosette({ className, size = 260, style }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden
      className={className}
      style={{ width: size, height: size, ...style }}
    >
      <g stroke="#A6813F" strokeWidth="0.7">
        <rect x="22" y="22" width="56" height="56" />
        <rect x="22" y="22" width="56" height="56" transform="rotate(45 50 50)" />
        <circle cx="50" cy="50" r="18" />
        <circle cx="50" cy="50" r="27" />
        {Array.from({ length: 8 }, (_, k) => {
          const a = (k * Math.PI) / 4;
          return (
            <line
              key={k}
              x1={50 + 18 * Math.cos(a)}
              y1={50 + 18 * Math.sin(a)}
              x2={50 + 40 * Math.cos(a)}
              y2={50 + 40 * Math.sin(a)}
            />
          );
        })}
      </g>
    </svg>
  );
}

/* small calligraphic flourish (tops of panels and cards) */
export function CardFlourish({ className = "h-4 w-20" }) {
  return (
    <svg viewBox="0 0 80 20" fill="none" aria-hidden className={className}>
      <path
        d="M8 9 C18 1 30 3 36 9 M72 9 C62 1 50 3 44 9 M36 9 C38 13 42 13 44 9"
        stroke="#A6813F"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="8" cy="9" r="1.6" fill="#A6813F" />
      <circle cx="72" cy="9" r="1.6" fill="#A6813F" />
      <rect x="38.4" y="14" width="3.2" height="3.2" transform="rotate(45 40 15.6)" fill="#A6813F" />
    </svg>
  );
}

/* centered divider ornament: scrolls, eight-point star and a tiny jewel */
export function DividerOrnament({ className = "h-6 w-28" }) {
  return (
    <svg viewBox="0 0 120 26" fill="none" aria-hidden className={className}>
      <path
        d="M6 13 C22 5 36 7 48 13 M6 13 C22 21 36 19 48 13"
        stroke="#C6A15B"
        strokeWidth="1"
        opacity="0.8"
      />
      <path
        d="M114 13 C98 5 84 7 72 13 M114 13 C98 21 84 19 72 13"
        stroke="#C6A15B"
        strokeWidth="1"
        opacity="0.8"
      />
      <circle cx="6" cy="13" r="1.5" fill="#C6A15B" opacity="0.85" />
      <circle cx="114" cy="13" r="1.5" fill="#C6A15B" opacity="0.85" />
      {/* eight-point star */}
      <path
        d="M60 3.5 L62.2 10.4 L69.5 13 L62.2 15.6 L60 22.5 L57.8 15.6 L50.5 13 L57.8 10.4 Z"
        fill="#C6A15B"
      />
      <path
        d="M60 6.5 L61.6 11 L66.5 13 L61.6 15 L60 19.5 L58.4 15 L53.5 13 L58.4 11 Z"
        fill="#D8BD7A"
        opacity="0.9"
      />
      {/* tiny gold diamond jewel */}
      <rect
        x="58.2"
        y="11.2"
        width="3.6"
        height="3.6"
        transform="rotate(45 60 13)"
        fill="#F5EBCB"
        stroke="#A6813F"
        strokeWidth="0.6"
      />
    </svg>
  );
}

/* small eight-point star, used as timeline nodes and accents */
export function StarNode({ className = "h-3 w-3" }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={className}>
      <path
        d="M10 0 L12.2 7.8 L20 10 L12.2 12.2 L10 20 L7.8 12.2 L0 10 L7.8 7.8 Z"
        fill="#C6A15B"
      />
      <circle cx="10" cy="10" r="2" fill="#FDFAF3" />
    </svg>
  );
}
