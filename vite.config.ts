import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  resolve: {
    alias: {
      'vscode': path.resolve(__dirname, './src/utils/vscode-mock.ts'),
      '@latexlint': path.resolve(__dirname, './node_modules/latexlint/src'),
      '@latexcitation': path.resolve(__dirname, './node_modules/latexcitation/src')
    }
  },
  define: {
    // Node.js環境変数をブラウザ用に
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  // GitHub Pages用の設定
  base: '/latexpages/',
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        latexlint: path.resolve(__dirname, 'latexlint/index.html'),
        latexcitation: path.resolve(__dirname, 'latexcitation/index.html'),
        latexwriting: path.resolve(__dirname, 'latexwriting/index.html'),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    fileParallelism: false
  }
})
