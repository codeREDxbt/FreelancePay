import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['src/lib/firebase/contracts.rules.test.ts'],
    testTimeout: 60_000,
    hookTimeout: 60_000,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
