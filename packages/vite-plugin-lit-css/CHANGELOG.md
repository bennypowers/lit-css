# @pwrs/vite-plugin-lit-css

## 3.0.0

### Major Changes

- 738a45c: Ship CommonJS declarations, which requires TypeScript 5.3 or newer for CommonJS consumers.

  The package's types re-export Vite's `Plugin`, and Vite's `require` condition resolves to `declare const module: any; export = module`. The generated `*.d.cts` therefore points those imports at Vite's ESM types with an import attribute, and TypeScript 4.7 through 5.2 cannot parse it. Non-strict CommonJS projects on those versions previously compiled against implicit `any` and now fail to parse the declaration.

  Previously a CommonJS TypeScript consumer of this package got TS7016 "Could not find a declaration file". Now it resolves, given TypeScript 5.3 or newer.

### Patch Changes

- Updated dependencies [fa515eb]
- Updated dependencies [a44ec4c]
  - @pwrs/lit-css@5.0.0

## 2.0.2

### Patch Changes

- 75139aa: fix: enable HMR for vite-plugin-lit-css

  Add `addWatchFile` in the `load` hook so Vite watches the underlying CSS files for changes, and add `handleHotUpdate` hook to invalidate virtual modules when their source CSS files change.

## 2.0.1

### Patch Changes

- 2ced312: Fix `@pwrs/lit-css` type import

## 2.0.0

### Major Changes

- 7ba04d5: Rename package from `vite-plugin-lit-css` to `@pwrs/vite-plugin-lit-css`

## 1.1.0

### Minor Changes

- 3bfb9ee: Add Vite plugin for importing CSS files as Lit tagged template literals

  This new package provides a Vite plugin that transforms CSS imports into Lit's `css` tagged template literals, enabling seamless CSS-in-JS workflow for Lit components in Vite projects.

  Features:

  - Works with both Vite dev server and build modes
  - Supports virtual module system for proper module resolution
  - Handles bare specifiers, relative paths, and aliases via Vite's resolution system
  - Compatible with multiple CSS preprocessor extensions (`.css`, `.scss`, `.sass`, `.less`, `.styl`)
  - Leverages the core `@pwrs/lit-css` transform library

### Patch Changes

- Updated dependencies [7422cd4]
  - @pwrs/lit-css@4.1.0

## 1.0.0

### Major Changes

- Initial release of Vite plugin for lit-css
- Support for importing CSS files as tagged template literals
- Compatible with Vite 4.x, 5.x, and 6.x
- Full support for custom transforms (Sass, PostCSS, etc.)
- Minification support via cssnano
- Hot Module Replacement (HMR) support
