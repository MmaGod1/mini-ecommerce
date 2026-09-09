import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#FBF6E9",
          100: "#F5E9C8",
          200: "#EAD28E",
          300: "#DFBB57",
          400: "#C9A227",
          500: "#B8860B",
          600: "#96690A",
          700: "#734F08",
          800: "#513806",
          900: "#2E2003",
        },
        ink: {
          900: "#1F1B10",
          700: "#3A3320",
          500: "#6B6248",
        },
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
