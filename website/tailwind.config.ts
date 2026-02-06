import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        accent: "#ffd12f",
        "accent-dim": "rgba(255, 209, 47, 0.15)",
        surface: "#0a0a0a",
        "surface-raised": "#111111",
        "surface-border": "#222222",
        dim: "#888888",
        fg: "#e8e8e8",
      },
    },
  },
  plugins: [],
};

export default config;
