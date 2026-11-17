/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0a0d18',
        surface: '#121829',
        card: '#1a2238',
        dark: {
          bg: '#0a0d18',
          surface: '#121829',
          card: '#1a2238',
          hover: '#222d48',
          border: '#232f4c',
        },
        accent: {
          DEFAULT: '#6366f1',
          indigo: '#6366f1',
          purple: '#8b5cf6',
          cyan: '#06b6d4',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
