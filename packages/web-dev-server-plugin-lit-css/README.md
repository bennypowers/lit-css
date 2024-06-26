# web-dev-server-plugin-lit-css

[Web Dev Server][wds] plugin to import css files as JavaScript tagged-template literal objects.

> _The "Lit" stands for "Literal"_

You can use it to import CSS for various libraries like `lit-element`, 
`@microsoft/fast-element`, or others.

## Do I Need This?

No. This is an optional package who's sole purpose is to make it easier to write 
CSS-in-CSS while working on lit-element projects. You can just as easily write 
your CSS in some '`styles.css.js`' modules a la:

```js
import { css } from 'lit-element';
export default css`:host { display: block; }`;
```

And this may actually be preferred.

Hopefully this package will become quickly obsolete when the [CSS Modules 
Proposal][modulesprop] (or something like it) is accepted and implemented.

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

## Usage

```js
import litcss from 'web-dev-server-plugin-lit-css';

export default {
  ...config,
  plugins: [
    litcss({
      include: ['**/elements/**/*.css'],
      exclude: ['**/docs/**/*.css'],
      cssnano: true,
    })
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

### Usage with Sass, Less, PostCSS, etc.

To load scss files:

1. Specify an `include` option which includes scss files (i.e. a glob or regexp)
1. Define a `transform` function in the plugin options.

```js
import litcss from 'web-dev-server-plugin-lit-css';
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
import litcss from 'web-dev-server-plugin-lit-css';
import postcss from 'postcss';
import postcssNesting from 'postcss-nesting';

const processor = postcss(postcssNesting());

export default {
  plugins: [
    litcss({
      include: '**/*.css',
      transform: (css, { filePath }) =>
        processor.process(css, { from: filePath })
          .css,
    }),
  ]
}
```

Looking for rollup? [rollup-plugin-lit-css](../rollup-plugin-lit-css)
Looking for esbuild? [esbuild-plugin-lit-css](../esbuild-plugin-lit-css)
Looking for webpack? [lit-css-loader](../lit-css-loader)

[wds]: https://modern-web.dev/docs/dev-server/
[modulesprop]: https://github.com/w3c/webcomponents/issues/759
[nanoopts]: https://cssnano.co/docs/config-file/#configuration-options

