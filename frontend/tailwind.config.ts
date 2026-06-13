import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sentinel: {
          dark: "#0f1117",
          card: "#1a1d2e",
          border: "#2a2d3e",
          accent: "#6366f1",
          success: "#22c55e",
          warning: "#f59e0b",
          danger: "#ef4444",
          critical: "#dc2626",
          muted: "#64748b",
        },
      },
    },
  },
  plugins: [],
};
export default config;
