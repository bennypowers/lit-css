import test from 'tape';

import { readFile, rm } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { $ } from 'execa';

const __dirname = dirname(fileURLToPath(import.meta.url));

const FIXTURES_DIR = join(__dirname, 'fixtures');
const EXPECTED_DIR = join(__dirname, 'expected');
const OUTPUT_DIR = join(__dirname, 'TSPC_OUTPUT');

const read = path =>
  readFile(resolve(EXPECTED_DIR, path), 'utf8');

const getCode = path =>
  readFile(resolve(OUTPUT_DIR, path), 'utf-8');

const compile = async dir => {
  const result = await $`npx tspc -p ${dir}`;

  if (result.stderr)
    throw new Error(`TS ERROR: ${result.stderr}`);
};

test('typescript-transform-lit-css', async function(assert) {
  await rm(OUTPUT_DIR, { recursive: true, force: true });

  await compile(FIXTURES_DIR);

  assert.equal(
    await getCode('default/input.js'),
    await read('default/output.js'),
    'exports a default style import',
  );

  assert.equal(
    await getCode('named/input.js'),
    await read('named/output.js'),
    'exports a named style import',
  );

  assert.equal(
    await getCode('element/input.js'),
    await read('element/output.js'),
    'generates a inline style in typical element use',
  );

  await compile(join(FIXTURES_DIR, 'cssnano'));

  assert.equal(
    await getCode('cssnano/input.js'),
    await read('cssnano/output.js'),
    'generates a inline style in typical element use, minified',
  );

  assert.equal(
    await getCode('special-chars/input.js'),
    await read('special-chars/output.js'),
    'handles special chars in CSS',
  );

  assert.end();
});
