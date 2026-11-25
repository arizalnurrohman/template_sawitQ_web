import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
  const proxy = {
    "/api": {
      target: env.SAWITQ_API_TARGET || "http://192.168.123.88:8000",
      changeOrigin: true,
      headers: { "X-API-KEY": env.SAWITQ_API_KEY || "your-api-key-1" },
    },
  };

  return {
    plugins: [react()],
    define: {
      __SAWITQ_API_BASE__: JSON.stringify(env.VITE_API_BASE_URL || "/api"),
      __SAWITQ_API_KEY__: JSON.stringify(env.VITE_API_KEY || ""),
    },
    server: { host: "127.0.0.1", port: 5173, strictPort: true, proxy },
    preview: { host: "127.0.0.1", port: 4173, strictPort: true, proxy },
  };
});
