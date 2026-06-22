import type { Config } from 'tailwindcss';

/**
 * Elite Pitch design system — baseline cho UI.
 *
 * Nguồn sự thật: `stitch_goalpredict_live_dashboard/elite_pitch/DESIGN.md` và các mockup
 * `stitch_goalpredict_live_dashboard/<screen>/code.html`. Token bên dưới khớp 1-1 với config
 * mà các mockup Stitch dùng, nên có thể port HTML mockup sang component mà class Tailwind
 * vẫn resolve đúng (màu Material-3, typography, spacing, radius).
 *
 * Legacy scale `pitch` / `gold` / `ink` được giữ lại cho các trang đã build (auth, admin)
 * trước khi baseline — không xoá để tránh vỡ giao diện cũ.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // --- Elite Pitch (Material-3) — baseline mockup Stitch ---
        background: '#0b1326',
        'on-background': '#dae2fd',
        surface: '#0b1326',
        'surface-dim': '#0b1326',
        'surface-bright': '#31394d',
        'surface-container-lowest': '#060e20',
        'surface-container-low': '#131b2e',
        'surface-container': '#171f33',
        'surface-container-high': '#222a3d',
        'surface-container-highest': '#2d3449',
        'surface-variant': '#2d3449',
        'surface-tint': '#4ae176',
        'on-surface': '#dae2fd',
        'on-surface-variant': '#bccbb9',
        'inverse-surface': '#dae2fd',
        'inverse-on-surface': '#283044',
        outline: '#869585',
        'outline-variant': '#3d4a3d',

        primary: '#4be277',
        'on-primary': '#003915',
        'primary-container': '#22c55e',
        'on-primary-container': '#004b1e',
        'inverse-primary': '#006e2f',
        'primary-fixed': '#6bff8f',
        'primary-fixed-dim': '#4ae176',
        'on-primary-fixed': '#002109',
        'on-primary-fixed-variant': '#005321',

        secondary: '#7bd0ff',
        'on-secondary': '#00354a',
        'secondary-container': '#00a6e0',
        'on-secondary-container': '#00374d',
        'secondary-fixed': '#c4e7ff',
        'secondary-fixed-dim': '#7bd0ff',
        'on-secondary-fixed': '#001e2c',
        'on-secondary-fixed-variant': '#004c69',

        tertiary: '#ffb5ab',
        'on-tertiary': '#60130d',
        'tertiary-container': '#ff8b7c',
        'on-tertiary-container': '#76231b',
        'tertiary-fixed': '#ffdad5',
        'tertiary-fixed-dim': '#ffb4a9',
        'on-tertiary-fixed': '#410001',
        'on-tertiary-fixed-variant': '#7f2a21',

        error: '#ffb4ab',
        'on-error': '#690005',
        'error-container': '#93000a',
        'on-error-container': '#ffdad6',

        // --- Legacy (trang đã build trước baseline) ---
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
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        'display-lg': ['Inter'],
        'headline-lg': ['Inter'],
        'headline-lg-mobile': ['Inter'],
        'headline-md': ['Inter'],
        'body-lg': ['Inter'],
        'body-sm': ['Inter'],
        'label-caps': ['Inter'],
        'data-mono': ['Inter'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-lg-mobile': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'headline-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-caps': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '700' }],
        'data-mono': ['14px', { lineHeight: '20px', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
      spacing: {
        base: '8px',
        gutter: '16px',
        'margin-mobile': '16px',
        'margin-desktop': '32px',
        'card-padding': '20px',
        'widget-gap': '24px',
      },
      // Radius giữ default Tailwind — đúng với config render của mockup Stitch
      // (lg=.5rem, xl=.75rem, 2xl=1rem). Chỉ thêm `md` cho khớp DESIGN.md.
      borderRadius: {
        md: '0.75rem',
      },
      boxShadow: {
        'accent-glow': '0 0 15px rgba(74, 225, 118, 0.3)',
        'input-glow': '0 0 0 2px rgba(75, 226, 119, 0.2)',
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'fade-in-right': 'fade-in-right 0.6s ease-out forwards',
        'scale-up': 'scale-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-right': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-up': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
