import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pantry: {
          50: "#F4F9F6",
          100: "#E3F0E9",
          500: "#2E6B58",
          600: "#1A3C34",
          700: "#15332C",
          900: "#0E241F",
        },
        cream: "#FFFBF2",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};

export default config;
