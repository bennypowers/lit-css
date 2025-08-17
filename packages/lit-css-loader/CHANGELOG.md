# Change Log

## 4.0.0

### Major Changes

- 0f9a613: Requires node >= 22

### Patch Changes

- Updated dependencies [0f9a613]
  - @pwrs/lit-css@4.0.0

## 3.0.1

### Patch Changes

- 92f38fe: chore: bump lit-css to 3.0.1

## 3.0.0

### Major Changes

- 2ef3460: Remove deprecated `uglifycss` options
- 2ef3460: Minimum Node version is now 20. Older versions may continue to work but are unsupported.

### Patch Changes

- Updated dependencies [2ef3460]
- Updated dependencies [2ef3460]
  - @pwrs/lit-css@3.0.0

## 2.0.1

### Patch Changes

- 24b4c45: update dependencies

## 2.0.0

### Major Changes

- 3a53b40: Remove support for older node versions.
  - ESM packages now require [es2020](https://node.green/#ES2020) support.
  - lit-css-loader now requires [es2018](https://node.green/#ES2018) support.

### Patch Changes

- Updated dependencies [3a53b40]
  - @pwrs/lit-css@2.0.0

## 1.2.2

### Patch Changes

- b283405: Update loader-utils dependency

## 1.2.1

### Patch Changes

- 5dec94c: Bump dependency

## 1.2.0

### Minor Changes

- 2b27339: Add a second parameter to the transform function which contains a `filePath` property, for use in error reporting, sourcemaps, etc.

### Patch Changes

- 2b27339: Fix `lit-css-loader` options which previously had to be wrapped in an object under `options.options`

  ### Before

  ```js
  module: {
    rules: [{
      test: /\.css$/,
      loader: 'lit-css-loader',
      options: {
        options: {
          uglify: true,
        },
      },
    }],
  },
  ```

  ### After

  ```js
  module: {
    rules: [{
      test: /\.css$/,
      loader: 'lit-css-loader',
      options: {
        uglify: true,
      },
    }],
  },
  ```

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

## 1.0.1

### Patch Changes

- de52d50: Fix a good-old-npm-package-files-field error, `.cjs` files should now appear in package tarballs
- Updated dependencies [de52d50]
  - @pwrs/lit-css@1.0.1

## 1.0.0

### Major Changes

- 2b6c62b: `import` option renamed to `specifier`
  `uglify` option added
- ac46bb6: Released esbuild-plugin-lit-css and unified logic and options

### Patch Changes

- Updated dependencies [ac46bb6]
  - @pwrs/lit-css@1.0.0

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).
This change log adheres to standards from [Keep a CHANGELOG](http://keepachangelog.com).

## [0.0.4] - 2020-08-28

### Fixed

- Fix build failure by escaping special characters

Fixes #1

Escapes backtick, backslash and \${ with a backslash when injecting the source CSS into a template literal in the generated ES module.
