# Parcel Transformer Integration Test

This directory contains an integration test that verifies the parcel-transformer-lit-css works correctly with real Parcel builds.

## Purpose

This integration test serves as proof that the transformer:
- Correctly transforms CSS imports into Lit's `css` tagged template literals
- Works with Parcel's build process
- Produces valid bundled output
- Handles the transformation properly in both dev and build modes

## Running the Integration Test

### Prerequisites

Before running the integration test, you need to pack the transformer package:

```bash
cd .. # Go to parcel-transformer-lit-css directory
npm pack
cd integration-test
```

This creates a `.tgz` file that the integration test can install (avoiding TypeScript source file issues).

### Build Mode

```bash
npm install
npm run build
```

This will build the test application and output to `dist/`.

### Dev Server Mode

```bash
npm install
npm run dev
```

This will start the Parcel dev server at `http://localhost:1234/`. Open the URL in your browser to see the component rendered with the transformed CSS.

## Verification

After building, check that:
1. The build completes without errors
2. The output file `dist/integration-test.*.js` contains the CSS imported from `styles.css` as a `css` tagged template literal
3. The styles are properly assigned to the component's `static styles` property
4. The hotpink color is applied to the h1 element

You can verify the transformation by searching for the CSS in the bundle:

```bash
grep "color.*hotpink" dist/*.js
```

## Why an Integration Test?

The transformer works by converting CSS files into JavaScript modules during Parcel's transform phase. An integration test with actual Parcel builds provides confidence that the transformer works in real-world scenarios.

Unlike unit tests that expect plain ES module output, Parcel bundles everything with its module runtime. This integration test verifies that despite Parcel's bundling, the CSS transformation works correctly and the styles are properly applied to Lit components.
