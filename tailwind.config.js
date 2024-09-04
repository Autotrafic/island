const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: '#4154F1',
        secondary: colors.rose,
        neutral: colors.stone,
        alert: colors.amber,
        danger: colors.red,
      },
    },
  },
  plugins: [],
};
