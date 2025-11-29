import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vitest/config"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [sveltekit(), tailwindcss()],
  ssr: {
    noExternal: [/^@templetto\//],
  },
  optimizeDeps: {
    exclude: [
      "@templetto/firebase",
      "@templetto/logging",
      "@templetto/app-error",
    ],
  },
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
    globals: true, /// allows to skip import of test functions like `describe`, `it`, `expect`, etc.
  },
})
