# rollup-plugin-lit-css

## 6.0.2

### Patch Changes

- fa515eb: Add `types` conditions to the exports maps and ship CommonJS declarations (`*.d.cts`).

  CommonJS TypeScript consumers (e.g. `module: "node16"` or `"nodenext"` in a `"type": "commonjs"` project) resolve the `require` condition and then look for a declaration file with a CommonJS extension. Without one, importing a package failed with TS7016 "Could not find a declaration file for module ...".

  `@pwrs/vite-plugin-lit-css` is not included yet: its declarations re-export types from Vite, whose `require` condition resolves to `declare const module: any; export = module`, so a plain copy cannot work. That package follows in a separate change.

- Updated dependencies [fa515eb]
- Updated dependencies [a44ec4c]
  - @pwrs/lit-css@5.0.0

## 6.0.1

### Patch Changes

- 2ced312: Fix `@pwrs/lit-css` type import

## 6.0.0

### Major Changes

- 0f9a613: Requires node >= 22

### Patch Changes

- Updated dependencies [0f9a613]
  - @pwrs/lit-css@4.0.0

## 5.0.2

### Patch Changes

- 92f38fe: chore: bump lit-css to 3.0.1

## 5.0.1

### Patch Changes

- 75b4881: Corrected types for include and exclude. No runtime changes

## 5.0.0

### Major Changes

- 2ef3460: Remove deprecated `uglifycss` options
- 2ef3460: Minimum Node version is now 20. Older versions may continue to work but are unsupported.

### Patch Changes

- Updated dependencies [2ef3460]
- Updated dependencies [2ef3460]
  - @pwrs/lit-css@3.0.0

## 4.0.1

### Patch Changes

- 9fd6b93: Update dependencies

## 4.0.0

### Major Changes

- 3a53b40: Remove support for older node versions.
  - ESM packages now require [es2020](https://node.green/#ES2020) support.
  - lit-css-loader now requires [es2018](https://node.green/#ES2018) support.

### Patch Changes

- Updated dependencies [3a53b40]
  - @pwrs/lit-css@2.0.0

## 3.2.1

### Patch Changes

- 5dec94c: Bump dependency

## 3.2.0

### Minor Changes

- 2b27339: Add a second parameter to the transform function which contains a `filePath` property, for use in error reporting, sourcemaps, etc.

### Patch Changes

- Updated dependencies [2b27339]
  - @pwrs/lit-css@1.2.0

## 3.1.0

### Minor Changes

- 1242fc1: Add support for transforms like Sass or PostCSS.

  See individual packages READMEs for examples.
  TL;DR: Pass a function to plugin options which takes source text and outputs CSS text.

### Patch Changes

- Updated dependencies [1242fc1]
  - @pwrs/lit-css@1.1.0

## 3.0.2

### Patch Changes

- 4e346e2: Fixed typings for plugin options

## 3.0.1

### Patch Changes

- de52d50: Fix a good-old-npm-package-files-field error, `.cjs` files should now appear in package tarballs
- Updated dependencies [de52d50]
  - @pwrs/lit-css@1.0.1

## 3.0.0

### Major Changes

- ac46bb6: Released esbuild-plugin-lit-css and unified logic and options
- ac46bb6: `import` option renamed to `specifier`

### Patch Changes

- Updated dependencies [ac46bb6]
  - @pwrs/lit-css@1.0.0
