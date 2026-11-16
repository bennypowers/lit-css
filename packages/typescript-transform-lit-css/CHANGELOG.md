# typescript-transform-lit-css

## 3.0.3

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

## 3.0.2

### Patch Changes

- fa515eb: Add `types` conditions to the exports maps and ship CommonJS declarations (`*.d.cts`).

  CommonJS TypeScript consumers (e.g. `module: "node16"` or `"nodenext"` in a `"type": "commonjs"` project) resolve the `require` condition and then look for a declaration file with a CommonJS extension. Without one, importing a package failed with TS7016 "Could not find a declaration file for module ...".

  `@pwrs/vite-plugin-lit-css` is not included yet: its declarations re-export types from Vite, whose `require` condition resolves to `declare const module: any; export = module`, so a plain copy cannot work. That package follows in a separate change.

- Updated dependencies [fa515eb]
- Updated dependencies [a44ec4c]
  - @pwrs/lit-css@5.0.0

## 3.0.1

### Patch Changes

- 2ced312: Fix `@pwrs/lit-css` type import

## 3.0.0

### Major Changes

- 0f9a613: Requires node >= 22

### Patch Changes

- Updated dependencies [0f9a613]
  - @pwrs/lit-css@4.0.0

## 2.0.2

### Patch Changes

- d85e257: Prevent `Error: Debug Failure. Did not expect SourceFile to have an Identifier in its trivia`. See [Typescript#39854](https://github.com/microsoft/TypeScript/issues/39854#issuecomment-732494514).

## 2.0.1

### Patch Changes

- 92f38fe: chore: bump lit-css to 3.0.1

## 2.0.0

### Major Changes

- 2ef3460: Remove deprecated `uglifycss` options
- 2ef3460: Removes `cleanCss` and adds `cssnano: boolean` options
- 2ef3460: Minimum Node version is now 20. Older versions may continue to work but are unsupported.

### Patch Changes

- Updated dependencies [2ef3460]
- Updated dependencies [2ef3460]
  - @pwrs/lit-css@3.0.0

## 1.1.1

### Patch Changes

- 3da01e3: Add peer dependencies
- 3da01e3: Fix error on unspecified exports, and unbundle the transformer module

## 1.1.0

### Minor Changes

- 08a095f: Add `cleanCss` config property, deprecate uglify css

### Patch Changes

- Updated dependencies [08a095f]
  - @pwrs/lit-css@2.1.0
