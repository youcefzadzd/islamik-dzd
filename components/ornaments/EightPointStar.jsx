import { buildStarPoints } from "./geometry";

/**
 * A light "rub el hizb"-style 8-point star, drawn as a pure SVG polygon.
 * Color it with Tailwind's text-* classes (uses currentColor).
 */
export default function EightPointStar({ size = 64, className = "", strokeOnly = false }) {
  const points = buildStarPoints(50, 50, 8, 46, 24);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      <polygon
        points={points}
        fill={strokeOnly ? "none" : "currentColor"}
        stroke="currentColor"
        strokeWidth={strokeOnly ? 1.5 : 0.75}
        strokeLinejoin="round"
      />
    </svg>
  );
}
