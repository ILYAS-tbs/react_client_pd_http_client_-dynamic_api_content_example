import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/", // Deploying to root of pedaconnect.com
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    host: "127.0.0.1", // Specify the host IP address
    port: 5173, // Optional: Specify a custom port if needed,
    watch: {
      usePolling: true,
      interval: 500, // adjust for performance
    },
  },
});
