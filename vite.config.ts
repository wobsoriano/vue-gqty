import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import pkg from './package.json'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'vue-gqty',
      fileName: format => `${pkg.name}.${format}.js`  
    },
    rollupOptions: {
      external: ['vue', 'gqty'],
      output: {
        globals: {
          vue: 'Vue',
          gqty: 'gqty'
        }
      }
    }
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      compilerOptions: {
        noEmit: false,
        declaration: true
      }
    })
  ],
  optimizeDeps: {
    exclude: ['vue-demi']
  }
});