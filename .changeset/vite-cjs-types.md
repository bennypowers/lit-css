---
'@pwrs/vite-plugin-lit-css': major
---

Ship CommonJS declarations, which requires TypeScript 5.3 or newer for CommonJS consumers.

The package's types re-export Vite's `Plugin`, and Vite's `require` condition resolves to `declare const module: any; export = module`. The generated `*.d.cts` therefore points those imports at Vite's ESM types with an import attribute, and TypeScript 4.7 through 5.2 cannot parse it. Non-strict CommonJS projects on those versions previously compiled against implicit `any` and now fail to parse the declaration.

Previously a CommonJS TypeScript consumer of this package got TS7016 "Could not find a declaration file". Now it resolves, given TypeScript 5.3 or newer.
