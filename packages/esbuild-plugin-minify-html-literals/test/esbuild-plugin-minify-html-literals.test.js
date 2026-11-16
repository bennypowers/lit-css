import { minifyHTMLLiteralsPlugin } from 'esbuild-plugin-minify-html-literals';

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import esbuild from 'esbuild';
import ab2str from 'arraybuffer-to-string';
import test from 'tape';


// type check
() => minifyHTMLLiteralsPlugin({ filter: /hi/ });

// TODO: test sourcemaps
// import { minifyHTMLLiterals } from 'minify-html-literals';
// import { readFile } from 'fs/promises';
// const { map } = minifyHTMLLiterals(await readFile(input, 'utf8'));
// # sourceMappingURL=${map.toUrl()}

const expected = `// packages/esbuild-plugin-minify-html-literals/test/fixture.js
import { html } from "lit";
var tpl = html\`<p>hello, world</p><input type="text"> <button type="button">button</button>\`;
export {
  tpl
};
`;

async function buildFixture(pluginFactory) {
  const input = fileURLToPath(new URL('./fixture.js', import.meta.url));
  const bundle = await esbuild.build({
    entryPoints: [input],
    target: 'es2020',
    format: 'esm',
    platform: 'node',
    external: ['snoot', 'lit', '@microsoft/fast-element'],
    bundle: true,
    write: false,
    plugins: [pluginFactory()],
  });
  return ab2str(bundle.outputFiles[0].contents);
}

test('esbuild-plugin-minify-html-literals', async function(assert) {
  assert.equal(await buildFixture(minifyHTMLLiteralsPlugin), expected, 'minifies html literals');
  assert.end();
});

test('esbuild-plugin-minify-html-literals CommonJS entry', async function(assert) {
  const require = createRequire(import.meta.url);
  const cjs = require('esbuild-plugin-minify-html-literals');
  assert.equal(
    await buildFixture(cjs.minifyHTMLLiteralsPlugin),
    expected,
    'minifies html literals through the require entry',
  );
  assert.end();
});
