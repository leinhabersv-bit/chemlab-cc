import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        lab: {
          50: "#f0f4f8",
          100: "#d9e2ec",
          200: "#bcccdc",
          300: "#9fb3c8",
          400: "#829ab1",
          500: "#627d98",
          600: "#486581",
          700: "#334e68",
          800: "#243b53",
          900: "#102a43",
          950: "#0b1b2d",
        },
        chem: {
          cyan: "#00d2d3",
          teal: "#01a3a4",
          amber: "#f39c12",
          red: "#ee5253",
          purple: "#5f27cd",
          steel: "#4682b4",
          winered: "#722f37",
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "Fira Code", "monospace"],
        serif: ["var(--font-serif)", "Newsreader", "Charter", "Georgia", "serif"],
      },
      animation: {
        "drop-fall": "drop 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards",
        "stir": "stirring 1.5s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        drop: {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "80%": { transform: "translateY(80px) scale(0.9)", opacity: "0.9" },
          "100%": { transform: "translateY(110px) scale(1.4)", opacity: "0" },
        },
        stirring: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "50%": { transform: "rotate(180deg)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        }
      }
    },
  },
  plugins: [],
};

export default config;

