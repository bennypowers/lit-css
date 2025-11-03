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
    "cssnano": true
  }
}
```

### Options

- `specifier` (string): The module to import the CSS tag from. Defaults to `'lit'`.
- `tag` (string): The name of the CSS tag function. Defaults to `'css'`.
- `cssnano` (boolean): Enable CSS minification. Defaults to `false`.

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

You can use CSS preprocessors by chaining Parcel's preprocessor transformers before this transformer in your `.parcelrc`:

```json
{
  "extends": "@parcel/config-default",
  "transformers": {
    "*.scss": ["@parcel/transformer-sass", "parcel-transformer-lit-css"]
  }
}
```

Make sure to install the preprocessor transformer:

```bash
npm install --save-dev @parcel/transformer-sass
```

This works with any Parcel transformer, including PostCSS, Less, and Stylus.

## License

ISC
