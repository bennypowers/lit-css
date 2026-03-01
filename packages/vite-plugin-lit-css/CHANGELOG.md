# @pwrs/vite-plugin-lit-css

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
