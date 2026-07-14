/** @type {import('tailwindcss').Config} */
export default {
  // CONTENT: Tell Tailwind which files to scan for class names.
  // Tailwind removes unused CSS in production (tree-shaking).
  // If you don't list a file here, classes used in it will be removed.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // CUSTOM COLORS: Extend the default Tailwind palette with LoL-inspired colors
      colors: {
        // Primary palette — LoL gold
        primary: {
          50:  '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308', // Main brand color (LoL gold)
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },
        // Dark backgrounds — LoL-style dark UI
        dark: {
          50:  '#f6f6f7',
          100: '#e2e2e5',
          200: '#c4c4ca',
          300: '#9d9daa',
          400: '#76767f',
          500: '#5c5c66',
          600: '#4a4a54',
          700: '#3e3e46',
          800: '#1a1a1f', // Main background
          900: '#0d0d10',
          950: '#050508',
        },
      },
      // Custom font family for headings
      fontFamily: {
        display: ['Georgia', 'serif'],
      },
      // Animation for loading spinners
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}
