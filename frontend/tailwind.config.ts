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
        ink: {
          50: "#f7f7f6",
          100: "#eeedeb",
          200: "#d8d6d2",
          600: "#4a4944",
          900: "#151412",
        },
        accent: {
          DEFAULT: "#ff7a00",
          soft: "#ffedd5",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["\"Fraunces\"", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -12px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
