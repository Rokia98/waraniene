import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fef7ee',
          100: '#fdedd6',
          200: '#fad8ad',
          300: '#f6ba78',
          400: '#f19441',
          500: '#ed751b',
          600: '#de5a11',
          700: '#b94310',
          800: '#943514',
          900: '#772e14',
          950: '#401608',
        },
        secondary: {
          50:  '#f7f6f3',
          100: '#ede9e1',
          200: '#ddd4c3',
          300: '#c5b79d',
          400: '#ad9876',
          500: '#9e865d',
          600: '#877051',
          700: '#6f5a44',
          800: '#5d4b3c',
          900: '#504135',
          950: '#2b211b',
        },
        terracotta: {
          50:  '#fdf3ef',
          100: '#fae4da',
          200: '#f6c9b5',
          300: '#f0a589',
          400: '#e87555',
          500: '#df5530',
          600: '#cc3e1f',
          700: '#aa301a',
          800: '#8a2919',
          900: '#72251a',
        },
        cream: {
          50:  '#fefdfb',
          100: '#fdf8f0',
          200: '#faf0df',
          300: '#f5e4c4',
          400: '#eed4a0',
          500: '#e4be78',
        }
      },
      fontFamily: {
        'sans':    ['Inter', 'sans-serif'],
        'display': ['Playfair Display', 'Georgia', 'serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      boxShadow: {
        'card':       '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
        'btn':        '0 2px 8px rgba(222,90,17,0.35)',
        'btn-hover':  '0 4px 16px rgba(222,90,17,0.45)',
        'glass':      '0 8px 32px rgba(0,0,0,0.12)',
        'inner-sm':   'inset 0 1px 3px rgba(0,0,0,0.06)',
        'xl-warm':    '0 20px 60px rgba(222,90,17,0.15)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'fade-in':      'fadeIn 0.4s ease-out',
        'slide-up':     'slideUp 0.4s ease-out',
        'slide-down':   'slideDown 0.3s ease-out',
        'scale-in':     'scaleIn 0.3s ease-out',
        'shimmer':      'shimmer 1.5s infinite',
        'float':        'float 3s ease-in-out infinite',
        'spin-slow':    'spin 3s linear infinite',
        'bounce-light': 'bounce 2s ease-in-out infinite',
        'pulse-warm':   'pulseWarm 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        pulseWarm: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.7' },
        },
      },
      backgroundImage: {
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':   'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-warm':    'linear-gradient(135deg, #fef7ee 0%, #fdedd6 50%, #fad8ad 100%)',
        'kente-pattern':    "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(222,90,17,0.08) 4px, rgba(222,90,17,0.08) 8px)",
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [],
};

export default config;
