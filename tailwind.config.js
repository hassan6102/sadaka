/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#123240',
        muted: '#52686F',
        paper: '#F2F5F4',
        line: '#D5E0DF',
        brand: { DEFAULT: '#1F6F78', dark: '#14515A', soft: '#E1EFEF' },
        support: { DEFAULT: '#8A5A0B', soft: '#FBEFD5' },
        done: { DEFAULT: '#276B47', soft: '#E1F1E7' },
        danger: { DEFAULT: '#A32B2B', soft: '#FBE6E6' },
      },
      fontFamily: {
        sans: ['Tajawal', 'system-ui', 'sans-serif'],
        display: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
