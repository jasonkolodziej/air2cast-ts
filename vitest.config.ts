import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    server: {
      deps: {
        inline: [/vite-test-utils/]
      },
    },
    deps: {
      inline: [/vite-test-utils/]
    },
  }
})