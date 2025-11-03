---
"vite-plugin-lit-css": minor
---

Add Vite plugin for importing CSS files as Lit tagged template literals

This new package provides a Vite plugin that transforms CSS imports into Lit's `css` tagged template literals, enabling seamless CSS-in-JS workflow for Lit components in Vite projects.

Features:
- Works with both Vite dev server and build modes
- Supports virtual module system for proper module resolution
- Handles bare specifiers, relative paths, and aliases via Vite's resolution system
- Compatible with multiple CSS preprocessor extensions (`.css`, `.scss`, `.sass`, `.less`, `.styl`)
- Leverages the core `@pwrs/lit-css` transform library
