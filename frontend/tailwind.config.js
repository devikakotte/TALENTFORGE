/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd',
          400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9',
          800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065',
        },
        cyanx: { 400: '#22d3ee', 500: '#06b6d4' },
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 18px 55px rgba(0,0,0,.16)',
        glow: '0 0 45px rgba(124,58,237,.20)',
      },
      backgroundImage: {
        'hero-grid': 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
