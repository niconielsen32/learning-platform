import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Duolingo-inspired palette
        owl: {
          green: "#58CC02",
          "green-dark": "#46A302",
          gold: "#FFC800",
          red: "#FF4B4B",
          blue: "#1CB0F6",
          purple: "#CE82FF",
          ink: "#3C3C3C",
          mist: "#E5E5E5",
        },
      },
      boxShadow: {
        button: "0 4px 0 0 rgba(0,0,0,0.15)",
        "button-active": "0 1px 0 0 rgba(0,0,0,0.15)",
      },
      animation: {
        "pop-in": "pop-in 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
      },
      keyframes: {
        "pop-in": {
          "0%": { transform: "scale(0.85)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
