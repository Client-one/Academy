import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7f5",
          100: "#d5ebe7",
          200: "#aad7cf",
          300: "#77bcb1",
          400: "#4a9c90",
          500: "#338075",
          600: "#27675f",
          700: "#22534d",
          800: "#1e433f",
          900: "#1b3835",
          950: "#0c1f1d",
        },
        ink: {
          50: "#f6f7f8",
          100: "#eceef0",
          200: "#d5d9de",
          300: "#b1b9c2",
          400: "#8793a1",
          500: "#687586",
          600: "#535e6d",
          700: "#444d59",
          800: "#3a424c",
          900: "#333942",
          950: "#22262d",
        },
      },
      fontFamily: {
        sans: ['"Segoe UI"', "Tahoma", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(16 24 40 / 0.06), 0 1px 3px 0 rgb(16 24 40 / 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
