import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        player: {
          bg: "#0f172a",
          card: "#1e293b",
          accent: "#8b5cf6",
        },
      },
      fontFamily: {
        game: ["var(--font-game)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-game)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
