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
        // Primary Cinematic Dark Design System Tokens
        'bg-base': '#0B0C10',
        'bg-page': '#12141B',
        'bg-primary': '#0B0C10',
        'bg-secondary': '#12141B',
        'surface-base': '#12141B',
        'surface-secondary': '#232633',

        'brand-primary': '#F0A15B',
        'brand-hover': '#F6B779',
        'brand-active': '#D98945',

        // Mapped primary/accent tokens
        'accent-primary': '#F0A15B',
        'accent-secondary': '#F6B779',
        'accent-soft': '#F6B779',

        // Category supporting accents
        'cat-anime': '#A78BFA',
        'cat-movies': '#F0A15B',
        'cat-manga': '#75C9A0',
        'cat-donghua': '#67BFD5',
        'cat-music': '#E68BA6',

        // Text hierarchy
        'text-primary': '#F2F0EC',
        'text-secondary': '#A2A4B1',
        'text-muted': '#747887',
        'text-disabled': '#555967',

        // Borders
        'border-default': '#343744',
        'border-hover': '#454958',
        'border-subtle': '#343744',

        // Nested token forms
        bg: {
          base: '#0B0C10',
          page: '#12141B',
          primary: '#0B0C10',
          secondary: '#12141B',
        },
        brand: {
          DEFAULT: '#F0A15B',
          primary: '#F0A15B',
          hover: '#F6B779',
          active: '#D98945',
        },
        surface: {
          DEFAULT: '#191C25',
          base: '#12141B',
          elevated: '#232633',
          secondary: '#232633',
        },
        accent: {
          DEFAULT: '#F0A15B',
          primary: '#F0A15B',
          secondary: '#F6B779',
          soft: '#F6B779',
          anime: '#A78BFA',
          movies: '#F0A15B',
          manga: '#75C9A0',
          donghua: '#67BFD5',
          music: '#E68BA6',
        },
        text: {
          primary: '#F2F0EC',
          secondary: '#A2A4B1',
          muted: '#747887',
          disabled: '#555967',
        },
        border: {
          DEFAULT: '#343744',
          default: '#343744',
          hover: '#454958',
          subtle: '#343744',
        },

        // Legacy compatibility aliases mapped to unified palette
        background: '#12141B',
        card: '#191C25',
        dark: {
          bg: '#0B0C10',
          surface: '#12141B',
          card: '#191C25',
          hover: '#232633',
          border: '#343744',
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
        heading: [
          'Outfit',
          'Inter',
          'sans-serif',
        ],
        inter: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '20px',
      },
      boxShadow: {
        'subtle-menu': '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
        'dialog': '0 24px 48px -12px rgba(0, 0, 0, 0.85)',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'soundwave-1': {
          '0%, 100%': { height: '4px' },
          '50%': { height: '14px' },
        },
        'soundwave-2': {
          '0%, 100%': { height: '12px' },
          '50%': { height: '5px' },
        },
        'soundwave-3': {
          '0%, 100%': { height: '7px' },
          '50%': { height: '15px' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        'soundwave-1': 'soundwave-1 0.8s ease-in-out infinite',
        'soundwave-2': 'soundwave-2 0.6s ease-in-out infinite',
        'soundwave-3': 'soundwave-3 0.7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
