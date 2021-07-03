import type { Plugin } from 'esbuild';

import { transform, Options } from '@pwrs/lit-css/lit-css';
import { readFile } from 'fs/promises';

export interface LitCSSOptions extends Options {
  filter: RegExp;
}

export function litCssPlugin(options?: LitCSSOptions): Plugin {
  const { filter = /\.css$/, specifier, tag, uglify } = options ?? {};
  return {
    name: 'lit-css',
    setup(build) {
      const loader = 'js';
      build.onLoad({ filter }, async args => {
        const css = await readFile(args.path, 'utf8');
        const contents = transform({ css, specifier, tag, uglify });
        return { contents, loader };
      });
    },
  };
}
