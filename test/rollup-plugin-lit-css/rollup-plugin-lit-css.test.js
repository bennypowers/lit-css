import litcss from 'rollup-plugin-lit-css';
import aliasPlugin from '@rollup/plugin-alias';

import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { rollup } from 'rollup';

import { run } from '../test.js';

const dir = dirname(fileURLToPath(import.meta.url));

async function getCode(path, { options, alias } = {}) {
  const additionalPlugins = [...alias ? [aliasPlugin({ entries: alias })] : []]
  const input = resolve(dir, '..', 'fixtures', path);
  const bundle = await rollup({ input, plugins: [litcss(options),...additionalPlugins] });
  const { output: [{ code }] } = await bundle.generate({ format: 'es' });
  return code;
}

run({ name: 'rollup-plugin-lit-css', getCode, dir })
