---
'esbuild-plugin-lit-css': patch
'esbuild-plugin-minify-html-literals': patch
'@pwrs/lit-css': patch
'lit-css-loader': patch
'parcel-transformer-lit-css': patch
'rollup-plugin-lit-css': patch
'typescript-transform-lit-css': patch
'web-dev-server-plugin-lit-css': patch
---

Add `types` conditions to the exports maps and ship CommonJS declarations (`*.d.cts`).

CommonJS TypeScript consumers (e.g. `module: "node16"` or `"nodenext"` in a `"type": "commonjs"` project) resolve the `require` condition and then look for a declaration file with a CommonJS extension. Without one, importing a package failed with TS7016 "Could not find a declaration file for module ...".

`@pwrs/vite-plugin-lit-css` is not included yet: its declarations re-export types from Vite, whose `require` condition resolves to `declare const module: any; export = module`, so a plain copy cannot work. That package follows in a separate change.
