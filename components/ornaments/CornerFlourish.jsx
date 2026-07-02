/**
 * A light arabesque corner flourish, pure line-art SVG. Meant to sit at
 * low opacity in a section corner — decorative, never the focal point.
 */
export default function CornerFlourish({ className = "", flipX = false, flipY = false }) {
  const transform = `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`;

  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      className={className}
      style={{ transform, transformOrigin: "center" }}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 4 C 34 4, 4 34, 4 64"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M4 4 C 4 34, 34 4, 64 4"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M4 18 C 20 18, 18 4, 18 4"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinecap="round"
      />
      <circle cx="4" cy="4" r="2.5" fill="currentColor" />
    </svg>
  );
}
