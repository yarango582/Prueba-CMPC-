import { defineConfig } from "vite";

export default defineConfig(async () => {
  const reactPlugin = (await import("@vitejs/plugin-react")).default;

  return {
    plugins: [reactPlugin()],
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
  };
});
