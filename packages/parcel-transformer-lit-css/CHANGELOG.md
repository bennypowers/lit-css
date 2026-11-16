# parcel-transformer-lit-css

## 1.1.3

### Patch Changes

- 7c3a368: Make CommonJS entries expose their default export directly, so
  `const plugin = require('@pwrs/vite-plugin-lit-css')` is the plugin factory
  instead of `{ default, ... }`. Named exports and `default` stay attached, so
  existing `require('pkg').default` code keeps working at runtime.
  
  The generated `.d.cts` files now use `export =` with a merged namespace, so
  `import pkg = require('pkg')` is callable and typed, while named types remain
  reachable as `pkg.LitCSSOptions`. A `const` default (webpack loader, Parcel
  transformer) cannot merge with a namespace, so for those two packages only type
  exports are re-exported and `.default` is untyped.
  
  `typescript-transform-lit-css` now keeps `typescript` external in its CommonJS
  bundle, so it runs against the consumer's compiler instead of an embedded copy.

## 1.1.2

### Patch Changes

- fa515eb: Add `types` conditions to the exports maps and ship CommonJS declarations (`*.d.cts`).

  CommonJS TypeScript consumers (e.g. `module: "node16"` or `"nodenext"` in a `"type": "commonjs"` project) resolve the `require` condition and then look for a declaration file with a CommonJS extension. Without one, importing a package failed with TS7016 "Could not find a declaration file for module ...".

  `@pwrs/vite-plugin-lit-css` is not included yet: its declarations re-export types from Vite, whose `require` condition resolves to `declare const module: any; export = module`, so a plain copy cannot work. That package follows in a separate change.

- Updated dependencies [fa515eb]
- Updated dependencies [a44ec4c]
  - @pwrs/lit-css@5.0.0

## 1.1.1

### Patch Changes

- 2ced312: Fix `@pwrs/lit-css` type import

## 1.1.0

### Minor Changes

- d27e0ef: Add Parcel transformer for importing CSS files as Lit tagged template literals

  This new package provides a Parcel transformer that converts CSS imports into Lit's `css` tagged template literals, enabling seamless CSS-in-JS workflow for Lit components in Parcel projects.

  Features:

  - Transforms CSS files into Lit `css` tagged templates during Parcel builds
  - Supports configuration via package.json
  - Compatible with CSS preprocessors through custom transform functions
  - Leverages the core `@pwrs/lit-css` transform library
  - Works with Parcel 2.x

### Patch Changes

- Updated dependencies [7422cd4]
  - @pwrs/lit-css@4.1.0
