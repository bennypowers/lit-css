---
'esbuild-plugin-minify-html-literals': patch
---

Keep `minify-html-literals` external in the CommonJS build. Bundling it inlined
`uglify-js`, whose `require.resolve('../lib/*.js')` calls cannot resolve from
inside the published tarball, so `require('esbuild-plugin-minify-html-literals')`
threw `Cannot find module '../lib/utils.js'`.

Adds a runtime test that `require()`s every package's CommonJS entry, and a
CommonJS variant of the minification test.
