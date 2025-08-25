import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite is used for the client build and dev server.
// In production, the Express server serves files from `dist/client`.
export default defineConfig({
  plugins: [react()],
  root: "client",
  build: {
    outDir: "../dist/client",
    emptyOutDir: true
  },
  server: {
    port: 5173
  }
});
