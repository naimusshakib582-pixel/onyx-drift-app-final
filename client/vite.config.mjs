import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: __dirname, // client folder কে root হিসেবে ধরে নেবে
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src") // frontend src folder
    }
  },
  build: {
    outDir: "dist",       // build output folder
    emptyOutDir: true     // পুরোনো build files clean করে দিবে
  }
});
