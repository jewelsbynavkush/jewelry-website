import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.ts',
        '**/*.d.ts',
        '.next/',
        'coverage/',
      ],
      thresholds: {
        lines: 70,
        functions: 65,
        branches: 59,
        statements: 70,
      },
    },
    testTimeout: 30000,
    hookTimeout: 60000, // Increased for replica set initialization
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
