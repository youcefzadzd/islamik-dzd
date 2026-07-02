/** @type {import('tailwindcss').Config} */

// Reads color values from CSS custom properties (set at runtime in
// app/layout.js from data/invitationData.js) so Tailwind's opacity
// modifiers (e.g. text-emerald/70) keep working while the actual
// colors stay fully config-driven.
function withOpacityValue(variable) {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`;
    }
    return `rgb(var(${variable}) / ${opacityValue})`;
  };
}

module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./data/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: withOpacityValue("--color-white"),
        ivory: {
          DEFAULT: withOpacityValue("--color-ivory"),
          light: withOpacityValue("--color-ivory-light"),
          dark: withOpacityValue("--color-ivory-dark"),
        },
        gold: {
          DEFAULT: withOpacityValue("--color-gold"),
          light: withOpacityValue("--color-gold-light"),
          dark: withOpacityValue("--color-gold-dark"),
        },
        emerald: {
          DEFAULT: withOpacityValue("--color-emerald"),
          light: withOpacityValue("--color-emerald-light"),
          dark: withOpacityValue("--color-emerald-dark"),
        },
        ink: withOpacityValue("--color-ink"),
        burgundy: {
          DEFAULT: withOpacityValue("--color-burgundy"),
          light: withOpacityValue("--color-burgundy-light"),
          dark: withOpacityValue("--color-burgundy-dark"),
        },
      },
      fontFamily: {
        arabicText: ["var(--font-arabic-text)", "serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        body: ["var(--font-body)", "Georgia", "serif"],
        monogram: ["var(--font-monogram)", "cursive"],
      },
      boxShadow: {
        royal: "0 25px 70px -20px rgb(var(--color-emerald) / 0.35)",
        card: "0 10px 30px -8px rgb(var(--color-emerald) / 0.12)",
        gold: "0 0 0 1px rgb(var(--color-gold) / 0.4)",
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        spinSlow: "spin 40s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [],
};
