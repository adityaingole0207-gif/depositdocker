import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FAF9F6', // Alabaster ivory background
          100: '#F5F3EE', // Soft warm ivory surface
          200: '#ECE9E2', // Delicate tint
          300: '#DFDBD2', // Hairline borders
          400: '#CBC6BC', // Active borders
          500: '#9C968B', // Neutral taupe
          600: '#6E695F', // Muted text
          700: '#48443D', // Secondary text
          800: '#2A2723', // Dark mode surface
          900: '#171614', // Deep obsidian ink
        },
        ink: {
          light: '#6E695F',
          DEFAULT: '#1E1D1A',
          dark: '#12110F',
        },
        forest: {
          50: '#F2F6F4',
          100: '#E2ECE7',
          500: '#245244', // Heritage forest green
          600: '#1C4136',
          700: '#153229',
        },
        vermilion: {
          50: '#FAF3F1',
          100: '#F6E3DF',
          500: '#BD3E28', // Refined terracotta vermilion
          600: '#A2321E',
          700: '#7E2413',
        },
        mustard: {
          50: '#FAF6EE',
          100: '#F5ECDA',
          500: '#B8781B',
          600: '#996113',
        },
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Fraunces', 'Georgia', 'serif'],
        sans: ['var(--font-plex-sans)', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'IBM Plex Mono', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 2px rgba(23, 22, 20, 0.03)',
        'luxury': '0 1px 3px rgba(23, 22, 20, 0.02), 0 8px 24px -4px rgba(23, 22, 20, 0.04)',
        'luxury-lg': '0 2px 4px rgba(23, 22, 20, 0.02), 0 20px 40px -8px rgba(23, 22, 20, 0.06)',
        'luxury-hover': '0 4px 6px rgba(23, 22, 20, 0.02), 0 16px 32px -4px rgba(23, 22, 20, 0.07)',
        'paper-sm': '0 1px 2px rgba(23, 22, 20, 0.03)',
        'paper': '0 1px 3px rgba(23, 22, 20, 0.02), 0 8px 20px -4px rgba(23, 22, 20, 0.04)',
        'paper-lg': '0 2px 4px rgba(23, 22, 20, 0.02), 0 16px 32px -6px rgba(23, 22, 20, 0.05)',
        'paper-xl': '0 4px 8px rgba(23, 22, 20, 0.03), 0 24px 48px -10px rgba(23, 22, 20, 0.07)',
        'paper-hard': '0 1px 3px rgba(23, 22, 20, 0.02), 0 8px 20px -4px rgba(23, 22, 20, 0.04)',
        'paper-hard-lg': '0 2px 4px rgba(23, 22, 20, 0.02), 0 16px 32px -6px rgba(23, 22, 20, 0.05)',
        'paper-hard-forest': '0 2px 8px rgba(36, 82, 68, 0.15)',
        'paper-hard-vermilion': '0 2px 8px rgba(189, 62, 40, 0.15)',
        'stamp': 'inset 0 0 0 1px currentColor',
      },
    },
  },
  plugins: [],
};

export default config;
