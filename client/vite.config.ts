import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const serverOrigin = process.env.SEEDBOX_SERVER_ORIGIN ?? "http://localhost:3000";

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": { target: serverOrigin },
    },
  },

  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
});
