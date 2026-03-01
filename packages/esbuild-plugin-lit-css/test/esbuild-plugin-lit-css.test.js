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
  const read = path => readFile(resolve(dir, 'expected', path), 'utf8');
  const inline = { inline: true };

  assert.equal(
    await getCode('basic/input.js', { options: inline }),
    await read('basic/inlined.js'),
    'inlines re-exports into the importing module',
  );

  assert.equal(
    await getCode('inline-edge-cases/mixed-import.js', { options: inline }),
    await read('inline-edge-cases/mixed-import.js'),
    'handles mixed default + named import',
  );

  assert.equal(
    await getCode('inline-edge-cases/existing-tag-import.js', { options: inline }),
    await read('inline-edge-cases/existing-tag-import.js'),
    'skips tag injection when already imported',
  );

  assert.equal(
    await getCode('inline-edge-cases/unrelated-specifier-import.js', { options: inline }),
    await read('inline-edge-cases/unrelated-specifier-import.js'),
    'injects tag import when specifier import exists but not the tag',
  );

  assert.equal(
    await getCode('inline-edge-cases/namespace-fallback.js', { options: inline }),
    await read('inline-edge-cases/namespace-fallback.js'),
    'falls back to module for namespace imports',
  );

  assert.equal(
    await getCode('inline-edge-cases/side-effect-fallback.js', { options: inline }),
    await read('inline-edge-cases/side-effect-fallback.js'),
    'falls back to module for side-effect imports',
  );

  assert.equal(
    await getCode('inline-edge-cases/multiple-imports.js', { options: inline }),
    await read('inline-edge-cases/multiple-imports.js'),
    'handles multiple imports of the same CSS file',
  );

  assert.end();
});
