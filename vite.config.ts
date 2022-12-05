import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import autoprefixer from "autoprefixer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  resolve: {
    // 配置别名路径
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // 服务端口配置
  server: {
    port: 6033,
    open: true,
  },
  css: {
    postcss: {
      // css 属性添加前缀插件
      plugins: [autoprefixer],
    },
  },
});
