---
"esbuild-plugin-lit-css": minor
"@pwrs/lit-css": minor
---

Add `inline` option to esbuild plugin. When enabled, CSS imports are inlined directly into the importing JS/TS module as tagged template literals, rather than creating separate modules. Also exports `toTaggedTemplateLiteral` from `@pwrs/lit-css`.
