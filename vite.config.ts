import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Inlines the JS + CSS into one portable index.html — handy for hackathon
    // submissions where the artifact is opened straight from disk or a CDN.
    viteSingleFile(),
  ],

  resolve: {
    alias: {
      // `@/components/...` → `src/components/...`
      "@": path.resolve(__dirname, "src"),
    },
  },

  // Local dev server defaults; `--host` exposes it on your LAN.
  server: {
    host: false,
    port: 5181,
    strictPort: true,
    open: false,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },

  build: {
    // Empty the output directory between builds so stale chunks never linger.
    outDir: "dist",
    emptyOutDir: true,
    // The whole app is one inlined HTML file, so a large single chunk is
    // expected — silence the misleading 500 kB warning.
    chunkSizeWarningLimit: 1600,
    // Keep readable-ish output for judges reading the deployed source.
    sourcemap: false,
    minify: "esbuild",
    target: "es2020",
    reportCompressedSize: false,
  },

  preview: {
    port: 4173,
    strictPort: false,
  },
});
