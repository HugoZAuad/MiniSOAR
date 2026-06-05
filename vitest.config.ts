import path from 'path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
    environment: 'node',
    alias: {
      'src': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    // Isso é necessário para o Vitest entender os decoradores do NestJS e TypeScript rápido
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
