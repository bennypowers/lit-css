# esbuild-plugin-lit-css

ESBuild plugin to import css files as JavaScript tagged-template literal objects.

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

| Name        | Accepts                                                                                | Default     |
| ----------- | -------------------------------------------------------------------------------------- | ----------- |
| `filter`    | RegExp of file names to apply to                                                       | `/\.css$/i` |
| `uglify`    | Boolean or Object of [uglifycss](https://www.npmjs.com/package/uglifycss#api) options. | `false`     |
| `specifier` | Package to import `css` from                                                           | `lit`       |
| `tag`       | Name of the template-tag function                                                      | `css`       |
| `transform` | Optional function (sync or async) which transforms css sources (e.g. postcss)          | `x => x`    |

## Usage

```js
import config from './esbuild.config.rest.js'
import litcss from 'esbuild-plugin-lit-css';

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
import { LitElement, customElement, html } from 'lit-element';

import style from './css-in-css.css';

@customElement('css-in-css')
class CSSInCSS extends LitElement {
  static get styles() {
    return [style];
  }

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

1. Specify the `filter` option to `litCssPlugin` to include scss files
1. Define a `transform` function in the plugin options.

```js
// esbuild script
import esbuild from 'esbuild';
import { renderSync } from 'sass';

await esbuild.build({
  entryPoints: [/*...*/],
  plugins: [
    litCssPlugin({
      filter: /.scss$/,
      transform: data => renderSync({ data }).css.toString(),
    }),
  ]
});
```

Similarly, to transform sources using PostCSS, specify a `transform` function:

```js
import esbuild from 'esbuild';
import postcss from 'postcss';
import postcssNesting from 'postcss-nesting';

const processor = postcss(postcssNesting());

await esbuild.build({
  entryPoints: [/*...*/],
  plugins: [
    litCssPlugin({
      transform: css => processor.process(css).css,
    }),
  ]
});
```

Looking for webpack? [lit-css-loader](../lit-css-loader)
Looking for rollup? [rollup-plugin-lit-css](../rollup-plugin-lit-css)
