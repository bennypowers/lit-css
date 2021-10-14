// @ts-check
import test from 'tape';

import postcss from 'postcss';
import postcssNesting from 'postcss-nesting';
import Sass from 'sass';

import { resolve } from 'path';
import { readFile } from 'fs/promises';

const processor = postcss(postcssNesting());

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
      'imports `css` from @microsoft/fast-element',
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

    assert.equal(
      await getCode('scss/input.js', {
        webpackOptions: {
          test: /\.scss$/,
        },
        options: {
          include: '/**/*.scss', // for rollup
          filter: /\.scss$/, // for esbuild
          uglify: true,
          transform: data => Sass.renderSync({ data }).css.toString(),
        },
      }),
      await read('scss/output.js'),
      'transforms scss sources',
    );

    assert.equal(
      await getCode('postcss/input.js', {
        options: {
          uglify: true,
          transform: css => processor.process(css).css,
        },
      }),
      await read('postcss/output.js'),
      'transforms postcss sources',
    );

    assert.end();
  });
}
