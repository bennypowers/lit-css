---
'@pwrs/vite-plugin-lit-css': patch
'rollup-plugin-lit-css': patch
'lit-css-loader': patch
'parcel-transformer-lit-css': patch
'web-dev-server-plugin-lit-css': patch
'typescript-transform-lit-css': patch
---

Make CommonJS entries expose their default export directly, so
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
