# @pwrs/vite-plugin-lit-css

Vite plugin to import CSS files as JavaScript tagged-template literal objects.

> _The "Lit" stands for "Literal"_

You can use it to import CSS for various libraries like `lit`, `@microsoft/fast-element`, or others.

## Do I Need This?

No. This is an optional package whose sole purpose is to make it easier to write CSS-in-CSS while working on lit-element projects. You can just as easily write your CSS in some '`styles.css.js`' modules a la:

```js
import { css } from 'lit';
export default css`:host { display: block; }`;
```

And this may actually be preferred.

Hopefully this package will become quickly obsolete when the [CSS Modules Proposal](https://github.com/w3c/webcomponents/issues/759) (or something like it) is accepted and implemented.

In the mean time, enjoy importing your CSS into your component files.

## Options

| Name        | Accepts                                                                       | Default        |
| ----------- | ----------------------------------------------------------------------------- | -------------- |
| `include`   | Array of glob of files to include.                                            | `['**/*.css']` |
| `exclude`   | Array of glob of files to exclude.                                            | `undefined`    |
| `cssnano`   | Boolean or Object of [cssnano][nanoopts] options.                             | `false`        |
| `specifier` | Package to import `css` from                                                  | `lit`          |
| `tag`       | Name of the template-tag function                                             | `css`          |
| `transform` | Optional function (sync or async) which transforms css sources (e.g. postcss) | `x => x`       |

## Installation

```bash
npm install --save-dev @pwrs/vite-plugin-lit-css
```

## Usage

```js
// vite.config.js
import { defineConfig } from 'vite';
import litCSS from '@pwrs/vite-plugin-lit-css';

export default defineConfig({
  plugins: [
    litCSS({ include: '**/*.css', cssnano: true })
  ]
});
```

Then import your CSS:

```css
:host {
  display: block;
}

h1 {
  color: hotpink;
}
```

```ts
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

import style from './css-in-css.css';

@customElement('css-in-css')
class CSSInCSS extends LitElement {
  static readonly styles = [style];

  render() {
    return html`<h1>It's Lit!</h1>`;
  }
}
```

### Usage with FAST

```js
// vite.config.js
import { defineConfig } from 'vite';
import litCSS from '@pwrs/vite-plugin-lit-css';

export default defineConfig({
  plugins: [
    litCSS({ specifier: '@microsoft/fast-element' })
  ]
});
```

```ts
import { FASTElement, customElement, html } from '@microsoft/fast-element';

import styles from './css-in-css.css';

const template = html<CSSinCSS>`<h1>It's Lit!</h1>`;

@customElement({ name: 'css-in-css', template, styles })
class CSSinCSS extends FASTElement {}
```

### Usage with Sass, Less, PostCSS, etc.

To load scss files:

1. Specify an `include` option which includes scss files (i.e. a glob or regexp)
2. Define a `transform` function in the plugin options.

```js
// vite.config.js
import { defineConfig } from 'vite';
import litCSS from '@pwrs/vite-plugin-lit-css';
import Sass from 'sass';

export default defineConfig({
  plugins: [
    litCSS({
      include: '**/*.scss',
      transform: (data, { filePath }) =>
        Sass.compile(filePath).css,
    })
  ]
});
```

Similarly, to transform sources using PostCSS, specify a `transform` function:

```js
// vite.config.js
import { defineConfig } from 'vite';
import litCSS from '@pwrs/vite-plugin-lit-css';
import postcss from 'postcss';
import postcssNesting from 'postcss-nesting';

const processor = postcss(postcssNesting());

export default defineConfig({
  plugins: [
    litCSS({
      transform: (css, { filePath }) =>
        processor.process(css, { from: filePath }).css,
    })
  ]
});
```

## Hot Module Replacement (HMR)

This plugin works seamlessly with Vite's HMR. When you modify a CSS file, Vite will automatically reload the module and update your component styles without a full page refresh.

## How It Works

This plugin uses Vite's `load` hook with `enforce: 'pre'` to intercept CSS imports before Vite's built-in CSS handling. Since Vite plugins are Rollup plugins under the hood, this plugin works with Vite's build process.

**Note:** This plugin is designed to transform CSS files into JavaScript tagged template literals. If you experience conflicts with Vite's built-in CSS handling in development mode, you may need to adjust your Vite configuration. The plugin has been tested primarily with production builds. For development server and Vitest usage, please test in your specific environment and report any issues.

## Other Plugins

Looking for other build tools?
- Webpack: [lit-css-loader](../lit-css-loader)
- esbuild: [esbuild-plugin-lit-css](../esbuild-plugin-lit-css)
- Rollup: [rollup-plugin-lit-css](../rollup-plugin-lit-css)
- TypeScript: [typescript-transform-lit-css](../typescript-transform-lit-css)

[nanoopts]: https://cssnano.co/docs/config-file/#configuration-options
