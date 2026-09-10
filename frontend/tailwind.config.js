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
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        student: {
          light: '#ecfdf5',
          primary: '#10b981',
          dark: '#047857',
        },
        company: {
          light: '#f0f9ff',
          primary: '#0ea5e9',
          dark: '#0369a1',
        },
        academician: {
          light: '#faf5ff',
          primary: '#8b5cf6',
          dark: '#6d28d9',
        },
        admin: {
          light: '#fffbeb',
          primary: '#f59e0b',
          dark: '#b45309',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
