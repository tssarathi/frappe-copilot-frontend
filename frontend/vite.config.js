import path from "path";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      name: "FrappeCopilot",
      formats: ["iife"],
      fileName: () => "js/frappe_copilot.js",
    },
    outDir: "../frappe_copilot/public/frontend/dist",
    emptyOutDir: true,
    rollupOptions: {
      external: ["frappe", "jQuery"],
      output: {
        globals: {
          frappe: "frappe",
          jQuery: "jQuery",
        },
        assetFileNames: "css/frappe_copilot.[ext]",
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
