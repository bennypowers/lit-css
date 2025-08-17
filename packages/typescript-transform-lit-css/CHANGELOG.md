# typescript-transform-lit-css

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
