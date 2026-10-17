import { defineConfig } from 'vitest/config';

// 相对路径：GitHub Pages 子目录与 Cloudflare Pages 根路径均可加载资源
export default defineConfig({
  base: './',
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
