import { defineConfig } from 'vitest/config';

const pages = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
  base: pages ? '/SixLines/' : '/',
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
