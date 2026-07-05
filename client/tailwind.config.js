/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // support class-based dark mode (we will enforce it on the root html)
  theme: {
    extend: {
      colors: {
        darkBg: '#0b0f19',      // Deep premium dark background
        darkCard: '#151c2c',    // Sleek card background
        darkBorder: '#222f47',  // Thin sleek borders
        accentBlue: '#2563eb',  // Main brand accent
        accentGlow: '#3b82f6',  // Glow effect highlights
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
