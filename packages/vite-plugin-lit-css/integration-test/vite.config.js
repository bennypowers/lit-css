import { defineConfig } from 'vite';
import litCSS from '../vite-plugin-lit-css.js';

export default defineConfig({
  plugins: [
    litCSS(),
  ],
  build: {
    lib: {
      entry: './src/my-element.js',
      formats: ['es'],
      fileName: 'my-element',
    },
    rollupOptions: {
      external: ['lit'],
    },
  },
});
