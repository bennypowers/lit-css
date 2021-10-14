import type { Plugin } from 'rollup';
import type { Options } from '@pwrs/lit-css/lit-css';

import { createFilter } from 'rollup-pluginutils';
import { transform } from '@pwrs/lit-css';
import { resolve } from 'path';

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

    load(id): null {
      if (filter(id)) this.addWatchFile(resolve(id));
      return null;
    },

    async transform(css, id) {
      if (!filter(id)) return null;
      const code = await transform({ css, specifier, tag, uglify, ...rest });
      return { code, map: { mappings: '' } };
    },
  };
}

export default litCss;
