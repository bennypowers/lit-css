---
"@pwrs/vite-plugin-lit-css": patch
---

fix: enable HMR for vite-plugin-lit-css

Add `addWatchFile` in the `load` hook so Vite watches the underlying CSS files for changes, and add `handleHotUpdate` hook to invalidate virtual modules when their source CSS files change.