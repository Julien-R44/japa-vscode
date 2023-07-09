import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  external: ['vscode'],
  format: ['cjs'],
  shims: false,
  noExternal: [
    'docblock',
    'fast-glob',
    'pkg-up',
    '@babel/parser',
    '@babel/types',
    'lodash.groupby',
    'vscode-ext-help-and-feedback-view',
    'vscode-html-languageservice',
    'vscode-languageserver-types',
    'youch',
    'slash',
    'execa',
    'emittery',
  ],
})
