import type { Plugin } from 'rollup';

import { createFilter } from 'rollup-pluginutils';
import { transform, Options } from '@pwrs/lit-css';
import { resolve } from 'path';

export interface LitCSSOptions extends Options {
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
  } = options ?? {};

  const filter = createFilter(include, exclude);

  return {
    name: 'lit-css',

    load(id): null {
      if (filter(id)) this.addWatchFile(resolve(id));
      return null;
    },

    transform(css, id) {
      if (id.slice(-4) !== '.css') return null;
      if (!filter(id)) return null;
      const code = transform({ css, specifier, tag, uglify });
      return { code, map: { mappings: '' } };
    },
  };
}

export default litCss;
