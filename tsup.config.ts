import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  external: ['vscode'],
  format: ['cjs'],
  shims: false,
  noExternal: [
    'docblock',
    'fast-glob',
    '@babel/parser',
    '@babel/types',
    'lodash.groupby',
    'vscode-ext-help-and-feedback-view',
    'vscode-html-languageservice',
    'vscode-languageserver-types',
  ],
})
