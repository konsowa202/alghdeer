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
    },
  },
  plugins: [],
};
export default config;
