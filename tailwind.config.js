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
          bg: '#090A0F',
          card: '#11141E',
          hover: '#161B29',
          subtle: '#0D1018',
        },
        light: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          hover: '#F1F5F9',
          subtle: '#F1F5F9',
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
        sans: ['var(--font-sans)', '"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['var(--font-sans)', '"Plus Jakarta Sans"', 'Inter', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', '"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
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
        shimmer: 'shimmer 1.8s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};
