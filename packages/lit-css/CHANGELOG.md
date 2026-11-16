# @pwrs/lit-css

## 5.0.0

### Major Changes

- a44ec4c: `Meta.filePath` is now optional, matching the optional `Options.filePath` that is passed to `transform` callbacks at runtime.

  Strict implementations of `Options.transform` that read `meta.filePath` as a `string` now need to handle `undefined`. This is a type-level break, hence the major release.

### Patch Changes

- fa515eb: Add `types` conditions to the exports maps and ship CommonJS declarations (`*.d.cts`).

  CommonJS TypeScript consumers (e.g. `module: "node16"` or `"nodenext"` in a `"type": "commonjs"` project) resolve the `require` condition and then look for a declaration file with a CommonJS extension. Without one, importing a package failed with TS7016 "Could not find a declaration file for module ...".

  `@pwrs/vite-plugin-lit-css` is not included yet: its declarations re-export types from Vite, whose `require` condition resolves to `declare const module: any; export = module`, so a plain copy cannot work. That package follows in a separate change.

## 4.1.0

### Minor Changes

- 7422cd4: Add `inline` option to esbuild plugin. When enabled, CSS imports are inlined directly into the importing JS/TS module as tagged template literals, rather than creating separate modules. Also exports `toTaggedTemplateLiteral` from `@pwrs/lit-css`.

## 4.0.0

### Major Changes

- 0f9a613: Requires node >= 22

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
