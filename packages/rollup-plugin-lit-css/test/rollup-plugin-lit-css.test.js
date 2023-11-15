import litcss from 'rollup-plugin-lit-css';
import aliasPlugin from '@rollup/plugin-alias';

import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rollup } from 'rollup';

import { run } from '@lit-css/test/test.js';

const dir = dirname(fileURLToPath(import.meta.url));

const FIXTURES_DIR = join(dir, '..', '..', '..', 'test', '😁-FIXTURES');

// type check
litcss({
  include: ['*'],
  exclude: ['*'],
});

run({
  dir,
  name: 'rollup-plugin-lit-css',
  async getCode(path, { options, alias } = {}) {
    const additionalPlugins = [...alias ? [aliasPlugin({ entries: alias })] : []];

    const input = resolve(FIXTURES_DIR, path);

    const bundle = await rollup({
      input,
      external: ['lit', '@microsoft/fast-element', 'snoot'],
      plugins: [
        litcss(options),
        ...additionalPlugins,
      ],
    });

    const { output: [{ code }] } = await bundle.generate({ format: 'es' });
    return code;
  },
});
