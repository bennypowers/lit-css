import type { Plugin } from 'esbuild';

import { minifyHTMLLiterals, DefaultOptions as MinifyOptions } from 'minify-html-literals';
import { readFile } from 'node:fs/promises';

export interface Options extends MinifyOptions {
  /** filter to apply to file paths */
  filter?: RegExp;
}

/*
 * This esbuild plugin minifies html in tagged template literals.
 * Pairs well with `lit-html`, `FAST`, `hybrids`, `htm`, etc.
 */
export function minifyHTMLLiteralsPlugin(options?: Options): Plugin {
  const { filter = /\.[jt]s$/, ...minifyOptions } = options ?? {};
  return {
    name: 'minifyHTMLLiterals',
    setup(build) {
      const cache = new Map();

      build.onLoad({ filter }, async ({ path }) => {
        const loader = path.match(/c?tsx?$/) ? 'ts' : 'js';
        const input = await readFile(path, 'utf8');
        const cached = cache.get(path);
        if (cached?.source === input)
          return cached.output;
        else {
          const result = minifyHTMLLiterals(input, minifyOptions) ?? undefined;
          const contents = result && `${result.code}\n//# sourceMappingURL=${result.map?.toUrl()}`;
          const output = result && { contents, loader };
          cache.set(path, { input, output });
          return output;
        }
      });
    },
  };
}

