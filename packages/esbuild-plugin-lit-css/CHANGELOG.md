# esbuild-plugin-lit-css

## 2.0.1

### Patch Changes

- 9fd6b93: Update dependencies

## 2.0.0

### Major Changes

- 3a53b40: Remove support for older node versions.
  - ESM packages now require [es2020](https://node.green/#ES2020) support.
  - lit-css-loader now requires [es2018](https://node.green/#ES2018) support.

### Patch Changes

- Updated dependencies [3a53b40]
  - @pwrs/lit-css@2.0.0

## 1.2.4

### Patch Changes

- e1450b1: Update dependencies and README

## 1.2.3

### Patch Changes

- 633f84f: Allow esbuild versions greater than 0.12. Tested with esbuild 0.14, but beware that future esbuild versions may break this plugin.

## 1.2.2

### Patch Changes

- f3f6ed9: Bump esbuild dependency

## 1.2.1

### Patch Changes

- 5dec94c: Bump dependency

## 1.2.0

### Minor Changes

- 2b27339: Add a second parameter to the transform function which contains a `filePath` property, for use in error reporting, sourcemaps, etc.

### Patch Changes

- Updated dependencies [2b27339]
  - @pwrs/lit-css@1.2.0

## 1.1.0

### Minor Changes

- 1242fc1: Add support for transforms like Sass or PostCSS.

  See individual packages READMEs for examples.
  TL;DR: Pass a function to plugin options which takes source text and outputs CSS text.

### Patch Changes

- Updated dependencies [1242fc1]
  - @pwrs/lit-css@1.1.0

## 1.0.3

### Patch Changes

- 4e346e2: Fixed typings for plugin options

## 1.0.2

### Patch Changes

- de52d50: Fix a good-old-npm-package-files-field error, `.cjs` files should now appear in package tarballs
- Updated dependencies [de52d50]
  - @pwrs/lit-css@1.0.1

## 1.0.1

### Patch Changes

- 0bc178f: fix npm metadata

## 1.0.0

### Major Changes

- ac46bb6: Released esbuild-plugin-lit-css and unified logic and options

### Patch Changes

- Updated dependencies [ac46bb6]
  - @pwrs/lit-css@1.0.0
