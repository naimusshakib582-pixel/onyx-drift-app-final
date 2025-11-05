/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enables class-based dark mode
  content: [
    "./index.html",               // Root HTML
    "./src/**/*.{js,jsx,ts,tsx}" // All React components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
