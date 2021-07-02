# lit-css-loader

Webpack loader to import css files as JavaScript tagged-template literal objects.

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

|Name|Accepts|Default|
|-----|-----|-----|
|`include`|Array of glob of files to include.|`['**/*.css']`|
|`exclude`|Array of glob of files to exclude. |`undefined`|
|`uglify`|Boolean or Object of [uglifycss](https://www.npmjs.com/package/uglifycss#api) options.|`false`|
|`specifier`|Package to import `css` from|`lit`|
|`tag`|Name of the template-tag function|`css`|

## Usage

```
npm i -D lit-css-loader
```

```js
module: {
  rules: [
    {
      test: /\.css$/,
      loader: 'lit-css-loader',
      options: {
        import: 'lit' // defaults to lit-element
      }
    }
  ]
}
```

```js
import { LitElement, html, customElement } from 'lit-element'

import style from './styled-el.css'

@customElement('styled-el')
export class extends LitElement {
  static styles = [style]
  render() {
    return html`<p>such style. very win</p>`
  }
}
```

Looking for rollup? [rollup-plugin-lit-css](../rollup-plugin-lit-css)
Looking for esbuild? [esbuild-plugin-lit-css](../esbuild-plugin-lit-css)
