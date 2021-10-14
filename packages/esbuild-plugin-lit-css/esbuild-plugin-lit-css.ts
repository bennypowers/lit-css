import type { Plugin } from 'esbuild';
import type { Options } from '@pwrs/lit-css/lit-css';
import { transform } from '@pwrs/lit-css';
import { readFile } from 'fs/promises';

export interface LitCSSOptions extends Omit<Options, 'css'> {
  filter: RegExp;
}

export function litCssPlugin(options?: LitCSSOptions): Plugin {
  const { filter = /\.css$/, specifier, tag, uglify, ...rest } = options ?? {};
  return {
    name: 'lit-css',
    setup(build) {
      const loader = 'js';
      build.onLoad({ filter }, async args => {
        const css = await readFile(args.path, 'utf8');
        const contents = await transform({ css, specifier, tag, uglify, ...rest });
        return { contents, loader };
      });
    },
  };
}
