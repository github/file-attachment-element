/// <reference types="vitest" />
export default {
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./test/setup.ts']
  }
}
