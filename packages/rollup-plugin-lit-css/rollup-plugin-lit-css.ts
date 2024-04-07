import type { Plugin } from 'rollup';
import type { Options } from '@pwrs/lit-css/lit-css';

import { createFilter } from '@rollup/pluginutils';
import { transform } from '@pwrs/lit-css';
import { resolve } from 'node:path';

export interface LitCSSOptions extends Omit<Options, 'css'> {
  include?: RegExp | string[];
  exclude?: RegExp | string[];
}

export function litCss(options?: LitCSSOptions): Plugin {
  const {
    exclude,
    include = /\.css$/i,
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
      try {
        const code = await transform({ css, specifier, tag, filePath: id, ...rest });
        return { code, map: { mappings: '' } };
      } catch (error) {
        this.error(error.message, {
          column: parseInt(error.column),
          line: parseInt(error.line),
        });
      }
    },
  };
}

export default litCss;
