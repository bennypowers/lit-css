import test from 'tape';

import { resolve } from 'path';
import { readFile } from 'fs/promises';

export async function run({ name, dir, getCode }) {
  const read = path => readFile(resolve(dir, 'expected', path), 'utf8');

  test(name, async function(assert) {
    assert.equal(
      await getCode('basic/input.js'),
      await read('basic/output.js'),
      'generates a basic style',
    );

    assert.equal(
      await getCode('special-chars/input.js'),
      await read('special-chars/output.js'),
      'handles special chars in CSS',
    );

    assert.equal(
      await getCode('basic/input.js', { options: { uglify: true } }),
      await read('basic/uglified.js'),
      'generates an uglified style',
    );

    assert.equal(
      await getCode('basic/input.js', { options: { specifier: '@microsoft/fast-element' } }),
      await read('basic/fast.js'),
      'imports \`css\` from @microsoft/fast-element',
    );

    assert.equal(
      await getCode('bare/input.js', { alias: { 'styles/styles.css': './styles.css' } }),
      await read('bare/output.js'),
      'imports from a bare specifier',
    );

    assert.equal(
      await getCode('basic/input.js', { options: { specifier: 'snoot', tag: 'boop' } }),
      await read('basic/boop.js'),
      'imports boop from snoot',
    );

    assert.end();
  });
}
