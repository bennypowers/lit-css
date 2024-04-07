# typescript-transform-lit-css

TypeScript transformer to import css files as JavaScript tagged-template literal objects.
Use it with [ts-patch](https://npm.im/ts-patch)

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

| Name        | Accepts                                                            | Default |
| ----------- | ------------------------------------------------------------------ | ------- |
| `cleanCss`  | Boolean, whether to minify css with cleanCss.                      | `false` |
| `inline`    | Boolean, whether to inline css imports into the typescript source. | `false` |
| `specifier` | Package to import `css` from                                       | `lit`   |
| `tag`       | Name of the template-tag function                                  | `css`   |

## Usage

```json5
{
  "compilerOptions": {
    "plugins": [
      {
        "transform": "typescript-transform-lit-css",
      },
    ]
  }
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

```json5
{
  "compilerOptions": {
    "plugins": [
      {
        "transform": "typescript-transform-lit-css",
        "specifier": "@microsoft/fast-element",
      },
    ]
  }
}
```

```ts
import { FASTElement, customElement, html } from '@microsoft/fast-element';

import styles from './css-in-css.css';

const template = html<CSSinCSS>`<h1>It's Lit!</h1>`;

@customElement({ name: 'css-in-css', template, styles })
class CSSinCSS extends FASTElement {}
```

Looking for esbuild? [esbuild-plugin-lit-css](../esbuild-plugin-lit-css)
Looking for webpack? [lit-css-loader](../lit-css-loader)
Looking for rollup? [rollup-plugin-lit-css](../rollup-plugin-lit-css)
