import type { Config } from "tailwindcss";

const config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        foreground: "#f5f5f5",
        surface: "#121212",
        border: "#232323",
        muted: "#a1a1aa",
        accent: {
          DEFAULT: "#d4b483",
          hover: "#e3c9a0",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "var(--font-geist-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      borderRadius: {
        DEFAULT: "0px",
        xs: "0px",
        sm: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
        "2xl": "0px",
        "3xl": "0px",
        "4xl": "0px",
      },
    },
  },
} satisfies Config;

export default config;
