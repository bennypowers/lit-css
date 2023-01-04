import litcss from 'rollup-plugin-lit-css';
import aliasPlugin from '@rollup/plugin-alias';

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rollup } from 'rollup';

import { run } from '../test.js';

const dir = dirname(fileURLToPath(import.meta.url));

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

    const input = resolve(dir, '..', '😁-FIXTURES', path);

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
