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
      const { path, body } = ctx;
      if (filter(path)) {
        // bust the cache
        ctx.set('Cache-Control', 'no-cache');
        ctx.set('ETag', Date.now().toString());
        ctx.set('Last-Modified', new Date().toString());
        return transform({
          css: body as string,
          specifier,
          tag,
          uglify,
          filePath: path,
          ...rest,
        });
      }
    },

    resolveMimeType({ path }) {
      if (filter(path))
        return 'js';
    },
  };
}

export default litCss;


