// client/postcss.config.js

export default {
  plugins: {
    'tailwindcss/nesting': {}, // যদি nesting ব্যবহার করেন, তবে এটি দরকার
    tailwindcss: {},
    autoprefixer: {},
  }
}