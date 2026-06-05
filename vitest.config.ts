import path from 'path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
    {
      name: 'fix-decorator-metadata-branches',
      enforce: 'post',
      transform(code, id) {
        if (id.includes('.ts') && !id.includes('node_modules') && !id.includes('.spec.')) {
          return code.replace(
            /typeof (\w+) === "undefined" \? Object : \1/g,
            '$1',
          );
        }
      },
    },
  ],
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
    environment: 'node',
    alias: {
      src: path.resolve(__dirname, './src'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'json', 'html'],
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
});