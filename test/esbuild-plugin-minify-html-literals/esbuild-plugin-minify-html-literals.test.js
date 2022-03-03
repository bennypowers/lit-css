import { minifyHTMLLiteralsPlugin } from 'esbuild-plugin-minify-html-literals';

import { fileURLToPath } from 'url';

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

test('esbuild-plugin-minify-html-literals', async function(assert) {
  const input = fileURLToPath(new URL('./fixture.js', import.meta.url));

  const bundle = await esbuild.build({
    entryPoints: [input],
    target: 'es2020',
    format: 'esm',
    platform: 'node',
    external: ['snoot', 'lit', '@microsoft/fast-element'],
    bundle: true,
    write: false,
    plugins: [
      minifyHTMLLiteralsPlugin(),
    ],
  });

  const expected = `// test/esbuild-plugin-minify-html-literals/fixture.js
import { html } from "lit";
var tpl = html\`<p>hello, world</p><input type="text"> <button type="button">button</button>\`;
export {
  tpl
};
`;

  assert.equal(
    ab2str(bundle.outputFiles[0].contents),
    expected,
    'minifies html literals',
  );

  assert.end();
});
