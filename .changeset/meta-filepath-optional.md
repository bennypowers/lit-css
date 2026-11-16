---
'@pwrs/lit-css': major
---

`Meta.filePath` is now optional, matching the optional `Options.filePath` that is passed to `transform` callbacks at runtime.

Strict implementations of `Options.transform` that read `meta.filePath` as a `string` now need to handle `undefined`. This is a type-level break, hence the major release.
