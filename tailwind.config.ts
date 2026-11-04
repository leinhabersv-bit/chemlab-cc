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
        bench: {
          950: "#0e1014",
          900: "#14171d",
          850: "#1a1e26",
          800: "#222732",
          700: "#2d3443",
          600: "#3d4659",
        },
        enamel: {
          50: "#faf9f6",
          100: "#f4f2ec",
          200: "#e8e5db",
          300: "#d6d1c2",
          400: "#aba593",
          500: "#807a6a",
        },
        instrument: {
          amber: "#f59e0b",
          amberDark: "#d97706",
          phosphor: "#22c55e",
          sky: "#38bdf8",
          cobalt: "#2563eb",
          ruby: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "Fira Code", "monospace"],
      },
      backgroundImage: {
        "bench-grid": "radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px)",
        "notebook-grid": "linear-gradient(to right, rgba(56, 189, 248, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.08) 1px, transparent 1px)",
      },
      backgroundSize: {
        "bench-grid": "24px 24px",
        "notebook-grid": "16px 16px",
      },
      animation: {
        "drop-fall": "drop 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards",
        "stir": "stirring 1.5s linear infinite",
        "pulse-slow": "pulseSlow 3s ease-in-out infinite",
      },
      keyframes: {
        drop: {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "80%": { transform: "translateY(80px) scale(0.9)", opacity: "0.9" },
          "100%": { transform: "translateY(110px) scale(1.4)", opacity: "0" },
        },
        stirring: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
