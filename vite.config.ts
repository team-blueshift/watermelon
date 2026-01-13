import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/watermelon/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'ES2020',
    outDir: 'dist',
  },
});
