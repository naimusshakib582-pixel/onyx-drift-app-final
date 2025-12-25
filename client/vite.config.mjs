import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build', // এটা ঠিক আছে কি না দেখুন
  },
  base: './' // optional, relative path use করলে কখনও কখনও help করে
});
