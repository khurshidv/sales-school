import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['game/**/*.test.ts', 'lib/**/*.test.ts'],
    environment: 'jsdom',
    coverage: {
      include: ['game/engine/**', 'game/systems/**', 'lib/game/**'],
      exclude: ['**/__tests__/**', '**/*.test.ts'],
      thresholds: {
        branches: { global: { min: 0 }, 'game/engine/**': 100, 'game/systems/**': 100 },
        functions: { global: { min: 0 }, 'game/engine/**': 100, 'game/systems/**': 100 },
        lines: { global: { min: 0 }, 'game/engine/**': 100, 'game/systems/**': 100 },
      },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
