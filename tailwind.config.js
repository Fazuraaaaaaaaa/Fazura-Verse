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
        // Design System Phase 2 Tokens
        'bg-primary': '#090912',
        'bg-secondary': '#11111D',
        'surface': '#181827',
        'surface-elevated': '#202033',
        'accent-primary': '#8B5CF6',
        'accent-secondary': '#A78BFA',
        'accent-soft': '#C4B5FD',
        'text-primary': '#F8FAFC',
        'text-secondary': '#A1A1B5',
        'text-muted': '#717187',
        'border-subtle': 'rgba(255, 255, 255, 0.08)',

        // Nested structure for both utility forms (e.g. bg-bg-primary and bg-primary)
        bg: {
          primary: '#090912',
          secondary: '#11111D',
        },
        surface: {
          DEFAULT: '#181827',
          elevated: '#202033',
        },
        accent: {
          DEFAULT: '#8B5CF6',
          primary: '#8B5CF6',
          secondary: '#A78BFA',
          soft: '#C4B5FD',
          indigo: '#6366f1',
          purple: '#8B5CF6',
          cyan: '#06b6d4',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#A1A1B5',
          muted: '#717187',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.08)',
        },

        // Backward compatibility aliases
        background: '#090912',
        card: '#181827',
        dark: {
          bg: '#090912',
          surface: '#11111D',
          card: '#181827',
          hover: '#202033',
          border: '#232f4c',
        },
      },
      fontFamily: {
        sans: [
          'Plus Jakarta Sans',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        heading: [
          'Space Grotesk',
          'Plus Jakarta Sans',
          'sans-serif',
        ],
        inter: ['Inter', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        space: ['"Space Grotesk"', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.05)' },
        },
        'soundwave-1': {
          '0%, 100%': { height: '4px' },
          '50%': { height: '16px' },
        },
        'soundwave-2': {
          '0%, 100%': { height: '14px' },
          '50%': { height: '6px' },
        },
        'soundwave-3': {
          '0%, 100%': { height: '8px' },
          '50%': { height: '18px' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        float: 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'soundwave-1': 'soundwave-1 0.8s ease-in-out infinite',
        'soundwave-2': 'soundwave-2 0.6s ease-in-out infinite',
        'soundwave-3': 'soundwave-3 0.7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
