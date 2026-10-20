import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#000000",
          light: "#0B0C10",
          mid: "#111111",
        },
        text: {
          DEFAULT: "#ffffff",
          muted: "#a1a1aa",
          dark: "#111111",
        },
        accent: "#FAFAFA",
      },
      fontFamily: {
        sans: ["var(--font-ibm)", "sans-serif"],
        arabic: ["var(--font-thamanya)", "serif"],
      },
      keyframes: {
        "liquid-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "flame-flicker": {
          "0%, 100%": { opacity: "0.85", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.04)" },
        },
        "liquid-flow": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        "liquid-spin": "liquid-spin 7s linear infinite",
        "liquid-spin-fast": "liquid-spin 3.5s linear infinite",
        "flame-flicker": "flame-flicker 2.5s ease-in-out infinite",
        "liquid-flow": "liquid-flow 6s ease infinite",
      },
    },
  },
  plugins: [],
};
export default config;
