import litCSS from '../vite-plugin-lit-css.js';

import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

import { run } from '@lit-css/test/test.js';

const dir = dirname(fileURLToPath(import.meta.url));

const FIXTURES_DIR = join(dir, '..', '..', '..', 'test', '😁-FIXTURES');

// type check
litCSS({
  include: ['*'],
  exclude: ['*'],
});

run({
  dir,
  name: 'vite-plugin-lit-css',
  async getCode(path, { options, alias } = {}) {
    const input = resolve(FIXTURES_DIR, path);
    const inputDir = dirname(input);

    const result = await build({
      configFile: false,
      logLevel: 'warn',
      build: {
        lib: {
          entry: input,
          formats: ['es'],
          fileName: 'output',
        },
        write: false,
        minify: false,
        rollupOptions: {
          external: ['lit', '@microsoft/fast-element', 'snoot'],
        },
      },
      resolve: {
        alias: alias ? Object.fromEntries(
          Object.entries(alias).map(([k, v]) => [k, resolve(inputDir, v)])
        ) : {},
      },
      plugins: [
        litCSS(options),
      ],
    });

    // Vite build returns an array when using lib mode
    const buildOutput = Array.isArray(result) ? result[0] : result;

    if (!buildOutput || !buildOutput.output)
      throw new Error('No output in build result');


    const chunk = buildOutput.output.find(item => item.type === 'chunk');

    if (!chunk)
      throw new Error('No chunk found in build output');


    return chunk.code;
  },
});
