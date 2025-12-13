// client/postcss.config.js - সঠিক কনফিগারেশন

export default {
  plugins: {
    'postcss-nesting': {}, 
    '@tailwindcss/postcss': {}, // নতুন এবং সঠিক Tailwind PostCSS প্লাগইন
    autoprefixer: {},
  }
}