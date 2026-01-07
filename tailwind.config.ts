import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tema oscuro premium
        dark: {
          900: '#0a0a0a',  // Negro profundo
          800: '#121212',  // Fondo principal
          700: '#1a1a1a',  // Cards
          600: '#242424',  // Bordes suaves
          500: '#2d2d2d',  // Hover states
          400: '#404040',  // Bordes activos
          300: '#525252',  // Texto secundario
          200: '#737373',  // Texto muted
          100: '#a3a3a3',  // Texto terciario
        },
        // Dorado mate premium
        gold: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#d4a853',  // Dorado mate principal
          500: '#c9973b',  // Dorado hover
          600: '#b8860b',  // Dorado activo
          700: '#92691a',
          800: '#78551c',
          900: '#65461d',
        },
        // Colores de estado
        success: {
          DEFAULT: '#22c55e',
          muted: '#166534',
        },
        danger: {
          DEFAULT: '#ef4444',
          muted: '#991b1b',
        },
        warning: {
          DEFAULT: '#f59e0b',
          muted: '#92400e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-gold': 'linear-gradient(135deg, #c9973b 0%, #d4a853 50%, #b8860b 100%)',
      },
      boxShadow: {
        'gold': '0 0 20px rgba(212, 168, 83, 0.15)',
        'gold-lg': '0 0 40px rgba(212, 168, 83, 0.2)',
        'dark': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
