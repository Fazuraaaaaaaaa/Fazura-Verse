import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#121212",
        foreground: "#FFFFFF",
        sidebar: "#000000",
        card: {
          DEFAULT: "#181818",
          hover: "#282828",
        },
        accent: {
          DEFAULT: "#1DB954",
          hover: "#1ed760",
          dark: "#169c46",
        },
        spotify: {
          bg: "#121212",
          black: "#000000",
          sidebar: "#000000",
          card: "#181818",
          cardHover: "#282828",
          elevated: "#242424",
          highlight: "#2a2a2a",
          green: "#1DB954",
          greenHover: "#1ed760",
          greenDark: "#169c46",
          text: "#FFFFFF",
          subtext: "#B3B3B3",
          muted: "#727272",
          divider: "#282828",
          player: "#181818",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
