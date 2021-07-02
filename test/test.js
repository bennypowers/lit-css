import test from 'tape';

import { resolve } from 'path';
import { readFile } from 'fs/promises';

export async function run({ name, dir, getCode }) {
  const read = path => readFile(resolve(dir, 'expected', path), 'utf8');

  test(`[${name}] generates a basic style`, async function(assert) {
    const code = await getCode('basic/input.js');
    const expected = await read('basic/output.js');
    assert.equal(code, expected);
    assert.end();
  });

  test(`[${name}] handles special chars in CSS`, async function(assert) {
    const code = await getCode('special-chars/input.js');
    const expected = await read('special-chars/output.js');
    assert.equal(code, expected);
    assert.end();
  });

  test(`[${name}] generates an uglified style`, async function(assert) {
    const code = await getCode('basic/input.js', { options: { uglify: true } });
    const expected = await read('basic/uglified.js');
    assert.equal(code, expected);
    assert.end();
  });

  test(`[${name}] imports \`css\` from @microsoft/fast-element`, async function(assert) {
    const specifier = '@microsoft/fast-element';
    const code = await getCode('basic/input.js', { options: { specifier } });
    const expected = await read('basic/fast.js');
    assert.equal(code, expected);
    assert.end();
  });

  test(`[${name}] imports from a bare specifier`, async function(assert) {
    const code = await getCode('bare/input.js', { alias: { 'styles/styles.css': './styles.css' } });
    const expected = await read('bare/output.js');
    assert.equal(code, expected);
    assert.end();
  });

  test(`[${name}] imports boop from snoot`, async function(assert) {
    const code = await getCode('basic/input.js', { options: { specifier: 'snoot', tag: 'boop' } });
    const expected = await read('basic/boop.js');
    assert.equal(code, expected);
    assert.end();
  });
}
