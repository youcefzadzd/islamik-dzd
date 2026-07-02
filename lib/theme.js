/**
 * Turns the hex colors in invitationData.theme.colors into CSS custom
 * properties so the whole site can be recolored purely by editing
 * data/invitationData.js.
 */

function hexToRgbTriplet(hex) {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const value = parseInt(full, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `${r} ${g} ${b}`;
}

const CSS_VARIABLE_MAP = {
  "--color-white": "white",
  "--color-ivory": "ivory",
  "--color-ivory-light": "ivoryLight",
  "--color-ivory-dark": "ivoryDark",
  "--color-gold": "gold",
  "--color-gold-light": "goldLight",
  "--color-gold-dark": "goldDark",
  "--color-emerald": "emerald",
  "--color-emerald-light": "emeraldLight",
  "--color-emerald-dark": "emeraldDark",
  "--color-ink": "ink",
  "--color-burgundy": "burgundy",
  "--color-burgundy-light": "burgundyLight",
  "--color-burgundy-dark": "burgundyDark",
};

export function buildThemeCssVariables(colors) {
  return Object.entries(CSS_VARIABLE_MAP)
    .map(([cssVar, key]) => `${cssVar}: ${hexToRgbTriplet(colors[key])};`)
    .join(" ");
}
