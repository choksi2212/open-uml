/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./app/renderer/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B1120',
          surface: '#1E293B',
          border: '#334155',
        },
      },
    },
  },
  plugins: [],
}

