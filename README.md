# lit-CSS Plugins

Build plugins to import css files as JavaScript tagged-template literal objects.

> _The "Lit" stands for "Literal"_

You can use it to import CSS for various libraries like `lit-element`, `@microsoft/fast-element`, or others.

## Do I Need This?

No. These are optional packages whose sole purpose is to make it easier to write CSS-in-CSS. You can just as easily write your CSS in some '`styles.css.js`' modules a la:

```js
import { css } from 'lit';
export default css`:host { display: block; }`;
```

And this may actually be preferred.

Hopefully this package will become quickly obsolete when the [CSS Modules Proposal](https://github.com/w3c/webcomponents/issues/759) (or something like it) is accepted and implemented.

In the mean time, enjoy importing your CSS into your component files.

- [Shared Logic](./packages/lit-css)
- [esbuild](./packages/esbuild-plugin-lit-css)
- [Webpack](./packages/lit-css-loader)
- [Rollup](./packages/rollup-plugin-lit-css)
