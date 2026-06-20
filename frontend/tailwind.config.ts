import type { Config } from 'tailwindcss';

/**
 * Elite Pitch palette — sporty football theme.
 * pitch  = field green (primary), gold = winner/reward accent (gold mechanic),
 * ink    = dark UI surfaces, whistle = neutral grays.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pitch: {
          50: '#eafaf1',
          100: '#cdf2db',
          200: '#9ce6b9',
          300: '#63d492',
          400: '#33bd70',
          500: '#16a34a', // primary
          600: '#0f8a3d',
          700: '#0c6e31',
          800: '#0b582a',
          900: '#094824',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // reward accent
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        ink: {
          50: '#f5f6f8',
          100: '#e6e9ee',
          700: '#243042',
          800: '#19222f',
          900: '#0f1722',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
