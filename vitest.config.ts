import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['game/**/*.test.ts', 'lib/**/*.test.ts'],
    environment: 'jsdom',
    coverage: {
      include: ['game/engine/**', 'game/systems/**'],
      exclude: ['**/__tests__/**', '**/*.test.ts'],
      thresholds: { branches: 100, functions: 100, lines: 100 },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
