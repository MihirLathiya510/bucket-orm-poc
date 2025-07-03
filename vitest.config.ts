import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    timeout: 30000, // 30 seconds for S3 operations
    testTimeout: 30000,
    setupFiles: [],
    include: [
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/examples/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
  },
}); 