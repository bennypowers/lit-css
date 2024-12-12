import type { Plugin } from 'esbuild';
import type { Options } from '@pwrs/lit-css/lit-css';
import { transform } from '@pwrs/lit-css';
import { readFile } from 'node:fs/promises';
import * as path from 'node:path';

export interface LitCSSOptions extends Omit<Options, 'css'> {
  filter: RegExp;
}

export function litCssPlugin(options?: LitCSSOptions): Plugin {
  const { filter = /\.css$/, specifier, tag, ...rest } = options ?? {};
  return {
    name: 'lit-css',
    setup(build) {
      const loader = 'js';

      build.onResolve({ filter }, args => {
        return {
          path: path.resolve(args.resolveDir, args.path),
          namespace: 'env-lit-css',
          pluginData: {
            // Needed when using the "js" loader to properly resolve "lit"
            resolveDir: args.resolveDir,
          },
        };
      });

      // Load paths tagged with the 'env-ns' namespace and behave as if
      // they point to a JSON file containing the environment variables.
      build.onLoad({ filter: /.*/, namespace: 'env-lit-css' }, async args => {
        const css = await readFile(args.path, 'utf8');
        const filePath = args.path;

        try {
          const contents = await transform({ css, specifier, tag, filePath, ...rest });
          return { contents, loader, resolveDir: args.pluginData.resolveDir };
        } catch (error) {
          return {
            errors: [{
              text: error.message,
              detail: error,
              location: {
                file: error.file,
                line: error.line,
                column: error.column,
              },
            }],
          };
        }
      });
    },
  };
}
