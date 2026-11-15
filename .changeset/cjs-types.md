---
'esbuild-plugin-lit-css': patch
'esbuild-plugin-minify-html-literals': patch
'@pwrs/lit-css': major
'lit-css-loader': patch
'parcel-transformer-lit-css': patch
'rollup-plugin-lit-css': patch
'typescript-transform-lit-css': patch
'@pwrs/vite-plugin-lit-css': major
'web-dev-server-plugin-lit-css': patch
---

Add `types` conditions to the exports maps and ship CommonJS declarations (`*.d.cts`).

CommonJS TypeScript consumers (e.g. `module: "node16"` or `"nodenext"` in a `"type": "commonjs"` project) resolve the `require` condition and then look for a declaration file with a CommonJS extension. Without one, importing a package failed with TS7016 "Could not find a declaration file for module ...".

`@pwrs/lit-css` (major): `Meta.filePath` is now optional, matching the optional `Options.filePath` that is actually passed to `transform` callbacks. This is a type-level break for strict implementations of `transform` that read `meta.filePath` as a `string`; they now need to handle `undefined`.

`@pwrs/vite-plugin-lit-css` (major): its `.d.cts` uses an import attribute to resolve Vite's ESM-only types, so CommonJS consumers need TypeScript 5.3 or newer. Non-strict CommonJS projects on TypeScript 4.7 through 5.2 previously compiled against implicit `any` and now fail to parse the declaration.
