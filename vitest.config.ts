import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['app/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['app/main/**/*.ts'],
      exclude: ['**/*.test.ts', '**/index.ts'],
    },
  },
});
