import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'], // 确保排除的依赖确实不需要预构建
  },
  server: {
    host: '0.0.0.0', // 允许局域网访问
    proxy: {
      '/cedd': {
        target: 'http://172.20.2.14:10400',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '/cedd/v1'), // 示例：转换路径
        // secure: false, // 如果目标服务器是 HTTPS 但证书不可信
      }
    }
  },
  build: {
    sourcemap: true // 生产环境调试需要时开启
  }
});