# esbuild-plugin-minify-html-literals

ESBuild plugin to minify HTML syntax in JavaScript tagged-template literals.
It's a thin wrapper around @asyncLiz' superlative [minify-html-literals](https://npm.im/minify-html-literals).

> _The "Lit" stands for "Literal"_

You can use it to build your lit-html, hybrids, FAST, htm, etc. projects for production

## Options

The same as [minify-html-literals](https://npm.im/minify-html-literals), with the following additions:

| Name        | Accepts                          | Default      |
| ----------- | -------------------------------- | ------------ |
| `filter`    | RegExp of file names to apply to | `/\.[jt]s$/` |

## Usage

```js
import esbuild from 'esbuild';
import { minifyHTMLLiteralsPlugin } from 'esbuild-plugin-minify-html-literals';

await esbuild.build({
  ...theRestOfYourConfig,
  plugins: [
    minifyHTMLLiteralsPlugin(),
  ],
});
```

