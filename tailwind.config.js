/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B0E14',
          card: '#121722',
          hover: '#171E2C',
          subtle: '#080A0F',
        },
        emerald: {
          DEFAULT: '#10B981',
          hover: '#059669',
          light: '#34D399',
          glow: 'rgba(16, 185, 129, 0.15)',
        },
        cyan: {
          DEFAULT: '#06B6D4',
          light: '#22D3EE',
          glow: 'rgba(6, 182, 212, 0.15)',
        },
        purple: {
          DEFAULT: '#8B5CF6',
          light: '#A78BFA',
          glow: 'rgba(139, 92, 246, 0.15)',
        },
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        xs: '8px',
        sm: '10px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        pill: '9999px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
