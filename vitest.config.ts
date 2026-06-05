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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 98,
        branches: 98,
        functions: 98,
        lines: 98,
      },
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.module.ts',
        'main.ts',
        '**/*.spec.ts',
        '**/*.dto.ts',
        '**/*.token.ts',
        '**/*.interface.ts',
        'infra/database/prisma/prisma.service.ts',
      ],
    },
  },
  plugins: [
    // Isso é necessário para o Vitest entender os decoradores do NestJS e TypeScript rápido
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
