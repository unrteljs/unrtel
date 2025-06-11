import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: './src/index.ts',
    node: './src/node.ts',
    browser: './src/browser.ts',
  },
  sourcemap: true,
  unused: true,
  fixedExtension: true,
})
