# web-dev-server-plugin-lit-css

## 4.0.3

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

## 4.0.2

### Patch Changes

- fa515eb: Add `types` conditions to the exports maps and ship CommonJS declarations (`*.d.cts`).

  CommonJS TypeScript consumers (e.g. `module: "node16"` or `"nodenext"` in a `"type": "commonjs"` project) resolve the `require` condition and then look for a declaration file with a CommonJS extension. Without one, importing a package failed with TS7016 "Could not find a declaration file for module ...".

  `@pwrs/vite-plugin-lit-css` is not included yet: its declarations re-export types from Vite, whose `require` condition resolves to `declare const module: any; export = module`, so a plain copy cannot work. That package follows in a separate change.

- Updated dependencies [fa515eb]
- Updated dependencies [a44ec4c]
  - @pwrs/lit-css@5.0.0

## 4.0.1

### Patch Changes

- 2ced312: Fix `@pwrs/lit-css` type import

## 4.0.0

### Major Changes

- 0f9a613: Requires node >= 22

### Patch Changes

- Updated dependencies [0f9a613]
  - @pwrs/lit-css@4.0.0

## 3.0.2

### Patch Changes

- 92f38fe: chore: bump lit-css to 3.0.1

## 3.0.1

### Patch Changes

- 75b4881: Corrected types for include and exclude. No runtime changes

## 3.0.0

### Major Changes

- 2ef3460: Remove deprecated `uglifycss` options
- 2ef3460: Minimum Node version is now 20. Older versions may continue to work but are unsupported.

### Patch Changes

- Updated dependencies [2ef3460]
- Updated dependencies [2ef3460]
  - @pwrs/lit-css@3.0.0

## 2.1.0

### Minor Changes

- 08a095f: Add `cssnano` config property, deprecate `uglify` config property.

### Patch Changes

- Updated dependencies [08a095f]
  - @pwrs/lit-css@2.1.0

## 2.0.5

### Patch Changes

- 22a22fa: Remove unused dependencies

## 2.0.4

### Patch Changes

- 24b4c45: update dependencies

## 2.0.3

### Patch Changes

- 3e226c8: Properly invalidate browser cache for transformed CSS files

## 2.0.2

### Patch Changes

- 9fd6b93: Update dependencies
- Updated dependencies [9fd6b93]
  - rollup-plugin-lit-css@4.0.1

## 2.0.1

### Patch Changes

- 184c53d: fix cache bug which required users to restart the server when transformed css files changed

## 2.0.0

### Major Changes

- 3a53b40: Initial release

### Patch Changes

- Updated dependencies [3a53b40]
  - rollup-plugin-lit-css@4.0.0
