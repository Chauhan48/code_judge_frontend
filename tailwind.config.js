/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
      },
      app: {
        light: "#ffffff",
        dark: "#0f172a",   // slate-900
      },
      card: {
        light: "#ffffff",
        dark: "#111827",   // gray-900
      },
      borderLight: "#e5e7eb",
      borderDark: "#1f2937",
    },
    animation: {
      'fade-in': 'fadeIn 0.4s ease-out',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0', transform: 'translateY(12px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      },
    },
  },
  plugins: [],
};
