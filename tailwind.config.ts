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
          50: '#fef7ee',
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
          50: '#f7f6f3',
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
        }
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'display': ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
};
export default config;