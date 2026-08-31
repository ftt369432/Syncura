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
        brand: {
          50: '#eefcf8',
          100: '#d5f7ee',
          200: '#aef0de',
          300: '#75e4cb',
          400: '#38d0b2',
          500: '#14b396',
          600: '#0d907a',
          700: '#0e7363',
          800: '#105c50',
          900: '#114c43',
          950: '#042b27',
        },
        slate: {
          850: '#172033',
          950: '#0b1120',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-teal': '0 0 20px -5px rgba(20, 179, 150, 0.3)',
        'glow-amber': '0 0 20px -5px rgba(245, 158, 11, 0.3)',
        'glow-rose': '0 0 20px -5px rgba(244, 63, 94, 0.3)',
      }
    },
  },
  plugins: [],
}
