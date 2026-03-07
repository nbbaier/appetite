import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Bundle analyzer - only in analyze mode
    mode === "analyze"
      ? visualizer({
          open: true,
          filename: "dist/stats.html",
          gzipSize: true,
          brotliSize: true,
        })
      : undefined,
  ].filter(Boolean),
  optimizeDeps: {
    include: ["lucide-react"],
  },
}));
