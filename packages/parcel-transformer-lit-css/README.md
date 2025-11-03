# parcel-transformer-lit-css

Parcel transformer to import CSS files as Lit tagged template literals.

## Installation

```bash
npm install --save-dev parcel-transformer-lit-css
```

## Usage

Add the transformer to your `.parcelrc`:

```json
{
  "extends": "@parcel/config-default",
  "transformers": {
    "*.css": ["parcel-transformer-lit-css"]
  }
}
```

Then import CSS files in your JavaScript/TypeScript code:

```javascript
import { LitElement, html } from 'lit';
import styles from './my-element.css';

export class MyElement extends LitElement {
  static styles = styles;

  render() {
    return html`<h1>Hello World</h1>`;
  }
}
```

## Configuration

Options can be configured in your `package.json`:

```json
{
  "lit-css": {
    "specifier": "@microsoft/fast-element",
    "tag": "css",
    "cssnano": true,
    "transform": "path/to/custom/transform.js"
  }
}
```

### Options

- `specifier` (string): The module to import the CSS tag from. Defaults to `'lit'`.
- `tag` (string): The name of the CSS tag function. Defaults to `'css'`.
- `cssnano` (boolean): Enable CSS minification. Defaults to `false`.
- `transform` (function | string): Custom CSS transformation function or path to a module exporting one.

## Example

### Input (`styles.css`)

```css
:host {
  display: block;
  padding: 16px;
}

h1 {
  color: hotpink;
}
```

### Output (JavaScript)

```javascript
import { css } from "lit";
const styles = css`:host {
  display: block;
  padding: 16px;
}

h1 {
  color: hotpink;
}
`;
export {
  styles as default,
  styles
};
```

## Preprocessors

You can use CSS preprocessors by providing a custom transform function:

```javascript
// custom-transform.js
import Sass from 'sass';

export default async function sassTransform(css, { filePath }) {
  return new Promise((resolve, reject) => {
    Sass.render({ data: css, file: filePath }, (err, result) => {
      if (err) reject(err);
      else resolve(result.css.toString());
    });
  });
}
```

Then configure it in `package.json`:

```json
{
  "lit-css": {
    "transform": "./custom-transform.js"
  }
}
```

## License

ISC
