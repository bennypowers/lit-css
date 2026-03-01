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

/* eslint-disable easy-loops/easy-loops, max-len */
test('esbuild-plugin-lit-css inline mode', async function(assert) {
  const read = path => readFile(resolve(dir, 'expected', path), 'utf8');
  const inline = { inline: true };
  const edge = name => [`inline-edge-cases/${name}.js`, `inline-edge-cases/${name}.js`];

  const cases = [
    ['basic/input.js', 'basic/inlined.js', 'inlines re-exports into the importing module'],
    [...edge('mixed-import'), 'handles mixed default + named import'],
    [...edge('existing-tag-import'), 'skips tag injection when already imported'],
    [...edge('unrelated-specifier-import'), 'injects tag import when specifier import exists but not the tag'],
    [...edge('namespace-fallback'), 'falls back to module for namespace imports'],
    [...edge('side-effect-fallback'), 'falls back to module for side-effect imports'],
    [...edge('multiple-imports'), 'handles multiple imports of the same CSS file'],
  ];

  for (const [input, expected, message] of cases)
    assert.equal(await getCode(input, { options: inline }), await read(expected), message);

  assert.end();
});
