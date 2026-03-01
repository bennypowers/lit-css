import { litCssPlugin } from 'esbuild-plugin-lit-css';
import esbuild from 'esbuild';
import aliasPlugin from 'esbuild-plugin-alias';

import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { run } from '@lit-css/test/test.js';
import { readFile } from 'node:fs/promises';
import test from 'tape';

import ab2str from 'arraybuffer-to-string';

// type check
litCssPlugin({ filter: /hi/ });

const dir = dirname(fileURLToPath(import.meta.url));

const FIXTURES_DIR = join(dir, '..', '..', '..', 'test', '😁-FIXTURES');

async function getCode(path, { options, alias } = {}) {
  const additionalPlugins = [...alias ? [
    aliasPlugin(
      Object.fromEntries(
        Object.entries(alias)
          .map(([k, v]) =>
            [k, resolve(FIXTURES_DIR, 'bare', v)])
      )
    ),
  ] : []];

  const input = resolve(FIXTURES_DIR, path);
  const bundle = await esbuild.build({
    entryPoints: [input],
    target: 'es2020',
    format: 'esm',
    platform: 'node',
    external: ['snoot', 'lit', '@microsoft/fast-element'],
    bundle: true,
    write: false,
    plugins: [
      litCssPlugin(options),
      ...additionalPlugins,
    ],
  });

  return ab2str(bundle.outputFiles[0].contents);
}

run({ name: 'esbuild-plugin-lit-css', getCode, dir });

test('esbuild-plugin-lit-css inline mode', async function(assert) {
  const actual = await getCode('basic/input.js', { options: { inline: true } });
  const expected = await readFile(resolve(dir, 'expected', 'basic', 'inlined.js'), 'utf8');
  assert.equal(actual, expected, 'inlines CSS into the importing module');
  assert.end();
});
