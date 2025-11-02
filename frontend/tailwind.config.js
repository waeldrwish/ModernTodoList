/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.indigo,
        accent: colors.teal,
      },
      boxShadow: {
        'md-elev': '0 3px 6px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)',
        'lg-elev': '0 10px 15px rgba(0,0,0,0.10), 0 4px 6px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      }
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

