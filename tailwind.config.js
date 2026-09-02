/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f9f4',
          100: '#e5f3e5',
          200: '#cbe7cc',
          300: '#a3d4a6',
          400: '#72ba77',
          500: '#489f4f',
          600: '#35813b',
          700: '#2c6631',
          800: '#26512a',
          900: '#204324',
          950: '#0d2410',
        },
        earth: {
          50: '#faf6f0',
          100: '#f3eadc',
          200: '#e6d3b8',
          300: '#d5b78f',
          400: '#c49968',
          500: '#b4814d',
          600: '#9b673e',
          700: '#7b4e33',
          800: '#66402d',
          900: '#543627',
          950: '#2e1c14',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-tamil)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        tamil: ['var(--font-tamil)', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
