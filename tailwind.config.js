/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brutal: {
          bg: '#f4f4f5', /* Concrete Paper */
          green: '#14532d', /* Tractor Green (Dark) */
          neon: '#ccff00', /* High-Vis Agri-Yellow/Green */
          dark: '#0a1f0a',
          olive: '#4b5320',
          border: '#000000',
          danger: '#ef4444'
        }
      },
      boxShadow: {
        'brutal': '6px 6px 0px 0px rgba(0,0,0,1)',
        'brutal-hover': '2px 2px 0px 0px rgba(0,0,0,1)',
        'brutal-lg': '12px 12px 0px 0px rgba(0,0,0,1)',
      },
      backgroundImage: {
        'tractor-tread': 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)',
        'agri-grid': 'radial-gradient(#d4d4d8 1px, transparent 1px)'
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
