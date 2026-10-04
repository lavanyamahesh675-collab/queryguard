import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./web/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#080B10",
          surface: "#0F172A",
          border: "#1E293B",
          muted: "#334155",
        },
        accent: {
          emerald: "#10B981",
          crimson: "#EF4444",
          violet: "#8B5CF6",
          amber: "#F59E0B",
          cyan: "#06B6D4",
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        pulseFast: "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(239, 68, 68, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(239, 68, 68, 0.6)" },
        }
      }
    },
  },
  plugins: [],
};

export default config;
