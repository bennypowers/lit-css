# parcel-transformer-lit-css

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
