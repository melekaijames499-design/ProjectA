/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B4332',
          light: '#2D5A47',
          dark: '#0F2C20',
        },
        secondary: {
          DEFAULT: '#52B788',
          light: '#74C69D',
          dark: '#409E71',
        },
        accent: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#EF4444',
          dark: '#B91C1C',
        },
        mintBg: '#F0FDF4',
        surface: '#FFFFFF',
        textPrimary: '#1F2937',
        textMuted: '#6B7280',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
