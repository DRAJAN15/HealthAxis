/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#0ea5e9', dark: '#0284c7', light: '#e0f2fe' },
        secondary: { DEFAULT: '#64748b', dark: '#475569', light: '#f1f5f9' },
        success:   { DEFAULT: '#22c55e', light: '#dcfce7' },
        warning:   { DEFAULT: '#f59e0b', light: '#fef3c7' },
        danger:    { DEFAULT: '#ef4444', light: '#fee2e2' },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
