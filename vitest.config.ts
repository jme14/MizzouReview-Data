import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true, // Enable global APIs like `describe` and `it`
        environment: 'node', // Use Node.js environment (or "jsdom" for browser tests)
        include: ['test/**/*.test.ts'], // Specify test file locations
    },
});
