/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#003527',
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          container: '#064e3b',
          fixed: '#b0f0d6',
          'fixed-dim': '#95d3ba',
        },
        secondary: {
          DEFAULT: '#006c49',
          fixed: '#6ffbbe',
          container: '#6cf8bb',
        },
        surface: {
          DEFAULT: '#f8f9ff',
          dim: '#cbdbf5',
          variant: '#d3e4fe',
          container: '#e5eeff',
          'container-low': '#eff4ff',
          'container-high': '#dce9ff',
          'container-highest': '#d3e4fe',
          'container-lowest': '#ffffff',
        },
        'on-surface': {
          DEFAULT: '#0b1c30',
          variant: '#404944',
        },
        'inverse-surface': '#213145',
        'outline-variant': '#bfc9c3',
        outline: '#707974',
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        'display-xl': ['64px', { lineHeight: '72px', letterSpacing: '-0.04em', fontWeight: '700' }],
        'headline-lg': ['40px', { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '500' }],
        'mono-data': ['14px', { lineHeight: '20px', letterSpacing: '-0.01em', fontWeight: '400' }],
      },
      maxWidth: {
        'container-max': '1440px',
      },
      spacing: {
        'section-gap': '80px',
        'margin-desktop': '64px',
        'margin-mobile': '20px',
        gutter: '24px',
      },
      borderRadius: {
        stitch: '0.75rem',
        'stitch-lg': '2rem',
      },
    },
  },
  plugins: [],
};