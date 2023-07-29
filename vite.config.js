import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        minify: 'esbuild',
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'tinyneat',
            fileName: 'tinyneat',
        }
    },
    test: {
        benchmark: {
            outputFile: "./bench-results.json"
        }
    }
})