---
'@pwrs/vite-plugin-lit-css': patch
---

Widen the `vite` peer range to include 7 and 8. The plugin already builds and
typechecks against both; the range was the only thing stopping installs.

The integration fixture now uses vite 8, and PR CI builds it against vite 7 and
8 so a future major fails here before it reaches consumers.
