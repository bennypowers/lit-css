# rollup-plugin-lit-css

Rollup plugin to import css files as JavaScript tagged-template literal objects.

> _The "Lit" stands for "Literal"_

You can use it to import CSS for various libraries like `lit-element`, `@microsoft/fast-element`, or others.

## Do I Need This?

No. This is an optional package who's sole purpose is to make it easier to write CSS-in-CSS while working on lit-element projects. You can just as easily write your CSS in some '`styles.css.js`' modules a la:

```js
import { css } from 'lit-element';
export default css`:host { display: block; }`;
```

And this may actually be preferred.

Hopefully this package will become quickly obsolete when the [CSS Modules Proposal](https://github.com/w3c/webcomponents/issues/759) (or something like it) is accepted and implemented.

In the mean time, enjoy importing your CSS into your component files.

## Options

| Name        | Accepts                                                                                | Default        |
| ----------- | -------------------------------------------------------------------------------------- | -------------- |
| `include`   | Array of glob of files to include.                                                     | `['**/*.css']` |
| `exclude`   | Array of glob of files to exclude.                                                     | `undefined`    |
| `uglify`    | Boolean or Object of [uglifycss](https://www.npmjs.com/package/uglifycss#api) options. | `false`        |
| `specifier` | Package to import `css` from                                                           | `lit`          |
| `tag`       | Name of the template-tag function                                                      | `css`          |
| `transform` | Optional function (sync or async) which transforms css sources (e.g. postcss)    | `x => x`       |

## Usage

```js
import config from './rollup.config.rest.js'
import litcss from 'rollup-plugin-lit-css';

export default {
  ...config,
  plugins: [
    litcss({ include, exclude, uglify })
  ]
}
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
plugins: [
  litcss({ specifier: '@microsoft/fast-element' })
]
```

```ts
import { FASTElement, customElement, html } from '@microsoft/fast-element';

import styles from './css-in-css.css';

const template = html<CSSinCSS>`<h1>It's Lit!</h1>`;

@customElement({ name: 'css-in-css', template, styles })
class CSSinCSS extends FASTElement {}
```

Looking for webpack? [lit-css-loader](../lit-css-loader)
Looking for esbuild? [esbuild-plugin-lit-css](../esbuild-plugin-lit-css)

### Usage with Sass, Less, PostCSS, etc.

To load scss files:

1. Specify an `include` option which includes scss files (i.e. a glob or regexp)
1. Define a `transform` function in the plugin options.

```js
// rollup.config.js
import litcss from 'rollup-plugin-lit-css';
import Sass from 'sass';

export default {
  plugins: [
    litcss({
      include: '/**/*.scss',
      transform: (data, { filePath }) =>
        Sass.renderSync({ data, file: filePath })
          .css.toString(),
    }),
  ]
}
```

Similarly, to transform sources using PostCSS, specify a `transform` function:

```js
// rollup.config.js
import litcss from 'rollup-plugin-lit-css';
import postcss from 'postcss';
import postcssNesting from 'postcss-nesting';

const processor = postcss(postcssNesting());

export default {
  plugins: [
    litcss({
      transform: (css, { filePath }) =>
        processor.process(css, { from: filePath })
          .css,
    }),
  ]
}
```

## Upgrade from version `2.x`

Starting with version `3.x`, the default import used when transforming the CSS files is `lit` (see `specifier` option above) which is LitElement 3.x. If you need this package to work with [LitElement 2.x](https://lit-element.polymer-project.org/), you have to set the specifier to `lit-element` like so:

```js
import config from './rollup.config.rest.js'
import litcss from 'rollup-plugin-lit-css';

export default {
  ...config,
  plugins: [
    litcss({ specifier: 'lit-element' })
  ]
}
```
