# @pwrs/lit-css

## 3.0.1

### Patch Changes

- b0cb17f: chore: bump cssnano from 6.x to 7.x

## 3.0.0

### Major Changes

- 2ef3460: Remove deprecated `uglifycss` options
- 2ef3460: Minimum Node version is now 20. Older versions may continue to work but are unsupported.

## 2.1.0

### Minor Changes

- 08a095f: Add `cssnano` config property, deprecate `uglify` config property.

## 2.0.0

### Major Changes

- 3a53b40: Remove support for older node versions.
  - ESM packages now require [es2020](https://node.green/#ES2020) support.
  - lit-css-loader now requires [es2018](https://node.green/#ES2018) support.

## 1.2.1

### Patch Changes

- d4ff2ca: Fixed the `transform` function signature's types.

## 1.2.0

### Minor Changes

- 2b27339: Add a second parameter to the transform function which contains a `filePath` property, for use in error reporting, sourcemaps, etc.

## 1.1.0

### Minor Changes

- 1242fc1: Add support for transforms like Sass or PostCSS.

  See individual packages READMEs for examples.
  TL;DR: Pass a function to plugin options which takes source text and outputs CSS text.

## 1.0.1

### Patch Changes

- de52d50: Fix a good-old-npm-package-files-field error, `.cjs` files should now appear in package tarballs

## 1.0.0

### Major Changes

- ac46bb6: Released esbuild-plugin-lit-css and unified logic and options
