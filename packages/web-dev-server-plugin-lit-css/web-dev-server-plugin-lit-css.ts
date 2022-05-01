import type { Options } from '@pwrs/lit-css/lit-css';
import type { Plugin } from '@web/dev-server-core';

import { litCss as litCssRollup } from 'rollup-plugin-lit-css';
import { createFilter } from '@rollup/pluginutils';

import { fromRollup } from '@web/dev-server-rollup';

export interface LitCSSOptions extends Omit<Options, 'css'> {
  include?: RegExp | string[];
  exclude?: RegExp | string[];
}

const rollupPluginLitCss = fromRollup(litCssRollup);

export function litCss(options?: LitCSSOptions): Plugin {
  const filter = createFilter(options?.include ?? /\.css$/i, options?.exclude);

  return {
    ...rollupPluginLitCss(options),
    name: 'lit-css',
    resolveMimeType(context) {
      if (filter(context.path))
        return 'js';
    },
  };
}

export default litCss;
