import autoprefixer from "autoprefixer";
import { fileURLToPath, URL } from "node:url";
import { visualizer } from "rollup-plugin-visualizer";
import { ConfigEnv, defineConfig, loadEnv } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv): any => {
  const env: Record<string, string> = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      // 编译结果分析插件
      visualizer({
        open: true
      })
    ],
    server: {
      port: Number.parseInt(env.VITE_SERVER_PORT),
      open: env.VITE_OPEN_BROWSER === "true" ? true : false
    },
    resolve: {
      // 配置别名路径
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url))
      }
    },
    css: {
      postcss: {
        plugins: [autoprefixer]
      }
    }
  };
});
