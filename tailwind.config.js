/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./web/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./web/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./web/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
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
    },
  },
  plugins: [],
};
