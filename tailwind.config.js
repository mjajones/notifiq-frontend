/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brandDark: '#1e1e2f',
        brandLight: '#242436',
        accent: '#6366f1',
        // ...
      },
    },
  },
  plugins: [],
};
