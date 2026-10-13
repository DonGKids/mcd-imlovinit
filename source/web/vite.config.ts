import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        // 防护：仅把真正的后端接口（无扩展名的 /api/xxx）转发给后端。
        // 若前端源码中存在以 /api 开头的文件（如 /api/foo.ts），
        // 交回 Vite 处理，避免被误代理到后端而返回 404 HTML，
        // 进而导致模块 MIME 类型错误、整站白屏。
        bypass(req) {
          if (/\.(ts|tsx|js|jsx|css)$/.test(req.url || '')) {
            return req.url;
          }
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
