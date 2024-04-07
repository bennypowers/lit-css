// @ts-check
import test from 'tape';

import postcss from 'postcss';
import postcssNesting from 'postcss-nesting';
import Sass from 'sass';

import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';

const processor = postcss(postcssNesting());

async function sassAsync(data, { filePath }) {
  return new Promise((resolve, reject) => {
    Sass.render(({ data, file: filePath }), (exception, result) => {
      if (exception)
        reject(exception);
      else
        resolve(result.css.toString());
    });
  });
}

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
      await getCode('basic/input.js', { options: { cssnano: true } }),
      await read('basic/uglified.js'),
      'generates a minified style',
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
        options: {
          test: /\.scss$/, // for webpack
          include: '/**/*.scss', // for rollup
          filter: /\.scss$/, // for esbuild
          cssnano: true,
          transform: sassAsync,
        },
      }),
      await read('scss/output.js'),
      'transforms scss sources',
    );

    try {
      await getCode('scss/error.js', {
        options: {
          test: /\.scss$/, // for webpack
          include: '/**/*.scss', // for rollup
          filter: /\.scss$/, // for esbuild
          transform: sassAsync,
        },
      });
    } catch (e) {
      assert.match(
        e.message,
        new RegExp(`test/😁-FIXTURES/scss/error.scss 2:12  root stylesheet`),
        'handles sass errors'
      );
    }

    assert.equal(
      await getCode('postcss/input.js', {
        options: {
          cssnano: true,
          transform: css => processor.process(css).css,
        },
      }),
      await read('postcss/output.js'),
      'transforms postcss sources',
    );

    assert.end();
  });
}
