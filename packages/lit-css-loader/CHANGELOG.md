# Change Log

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
