import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: [
      'src/lib/firebase/contracts.rules.test.ts',
      'node_modules',
      'dist',
      '.next',
    ],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
