import type { Config } from "tailwindcss"

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        panel: "var(--panel)",
        "panel-2": "var(--panel-2)",
        border: "var(--border)",
        muted: "var(--muted)",
        accent: "var(--accent)",
      },
      borderRadius: {
        card: "18px",
      },
      keyframes: {
        "flash-row": {
          "0%": {
            background: "rgba(139, 92, 246, 0.34)",
            borderColor: "rgba(139, 92, 246, 0.72)",
          },
          "35%": {
            background: "rgba(139, 92, 246, 0.24)",
            borderColor: "rgba(139, 92, 246, 0.5)",
          },
          "100%": {
            background: "rgba(6, 10, 20, 0.74)",
            borderColor: "rgba(147, 168, 205, 0.12)",
          },
        },
      },
      animation: {
        "flash-row": "flash-row 3s ease forwards",
      },
    },
  },
  plugins: [],
} satisfies Config
