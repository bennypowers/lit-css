import type { Options } from '@pwrs/lit-css/lit-css';
import type { Plugin } from '@web/dev-server-core';

import { transform } from '@pwrs/lit-css';
import { createFilter } from '@rollup/pluginutils';

export interface LitCSSOptions extends Omit<Options, 'css'> {
  include?: RegExp | string[];
  exclude?: RegExp | string[];
}

export function litCss(options?: LitCSSOptions): Plugin {
  const {
    exclude,
    include = /\.css$/i,
    uglify,
    specifier,
    tag,
    ...rest
  } = options ?? {};

  const filter = createFilter(include, exclude);

  return {
    name: 'lit-css',

    async transform(ctx) {
      if (filter(ctx.path)) {
        const headers = {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'ETag': Date.now().toString(),
          'Last-Modified': new Date().toString(),
          'pragma': 'no-cache',
          'expires': '0',
        };
        const body = await transform({
          css: ctx.body as string,
          specifier,
          tag,
          uglify,
          filePath: ctx.path,
          ...rest,
        });
        return { body, headers, transformCache: false };
      }
    },

    resolveMimeType({ path }) {
      if (filter(path))
        return 'js';
    },
  };
}

export default litCss;
