# Vite Plugin Integration Test

This directory contains an integration test that verifies the vite-plugin-lit-css works correctly with real Vite builds.

## Purpose

This integration test serves as proof that the plugin:
- Correctly transforms CSS imports into Lit's `css` tagged template literals
- Works with Vite's build process
- Handles the virtual module system properly
- Produces valid bundled output

## Running the Integration Test

### Build Mode

```bash
npm run build
```

This will build the test application and output to `dist/my-element.js`.

### Dev Server Mode

```bash
npm run dev
```

This will start the Vite dev server at `http://localhost:5173/`. Open the URL in your browser to see the component rendered with the transformed CSS.

## Verification

After building, check that:
1. The build completes without errors
2. The output file `dist/my-element.js` contains the CSS imported from `styles.css` as a `css` tagged template literal
3. The styles are properly assigned to the component's `static styles` property

## Why an Integration Test?

The plugin uses Vite's virtual module system with custom resolution logic. An integration test with actual Vite builds provides confidence that the plugin works in real-world scenarios, complementing the unit tests.
