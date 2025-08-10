import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        code: 'src/code.ts',
        ui: 'src/ui.html',
      },
      output: {
        entryFileNames: (chunk) => `${chunk.name}.js`,
        assetFileNames: (asset) => {
          if (asset.name?.endsWith('.html')) return '[name][extname]'
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
    target: 'es2020',
  },
})
