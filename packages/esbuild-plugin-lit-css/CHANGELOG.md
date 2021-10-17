# esbuild-plugin-lit-css

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
