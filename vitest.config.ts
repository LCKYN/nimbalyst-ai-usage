import { defineConfig } from 'vitest/config';

// Tests pick their own environment with a `// @vitest-environment` header.
// `globals` lets Testing Library unmount between tests on its own.
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
});
