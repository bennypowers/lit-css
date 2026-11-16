# esbuild-plugin-minify-html-literals

## 3.0.1

### Patch Changes

- fa515eb: Add `types` conditions to the exports maps and ship CommonJS declarations (`*.d.cts`).

  CommonJS TypeScript consumers (e.g. `module: "node16"` or `"nodenext"` in a `"type": "commonjs"` project) resolve the `require` condition and then look for a declaration file with a CommonJS extension. Without one, importing a package failed with TS7016 "Could not find a declaration file for module ...".

  `@pwrs/vite-plugin-lit-css` is not included yet: its declarations re-export types from Vite, whose `require` condition resolves to `declare const module: any; export = module`, so a plain copy cannot work. That package follows in a separate change.

## 3.0.0

### Major Changes

- 0f9a613: Requires node >= 22

## 2.0.1

### Patch Changes

- 56d5eaa: Update allowed esbuild versions

## 2.0.0

### Major Changes

- 2ef3460: Remove deprecated `uglifycss` options
- 2ef3460: Minimum Node version is now 20. Older versions may continue to work but are unsupported.

## 1.0.6

### Patch Changes

- c4ebf3a: Update dependencies

## 1.0.5

### Patch Changes

- 9c58c8d: Add support for esbuild 0.18 as a peerDependency

## 1.0.4

### Patch Changes

- 3b79e94: update peerDependencies

## 1.0.3

### Patch Changes

- 24b4c45: update dependencies

## 1.0.2

### Patch Changes

- 9fd6b93: Update dependencies

## 1.0.1

### Patch Changes

- 1fb8191: Uses correct loader for TypeScript sources

## 1.0.0

### Major Changes

- 0dd08a6: Initial release
