import { access, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import test from 'tape';

import { cjsTypes, conditionTarget } from '../../../build.js';

const DECLARATION = `import type { Plugin } from 'vite';
export declare function plugin(): Plugin;
`;

function manifest(overrides = {}) {
  return JSON.stringify({
    name: 'fixture-pkg',
    types: './fixture-pkg.d.ts',
    exports: {
      '.': {
        import: { types: './fixture-pkg.d.ts', default: './fixture-pkg.js' },
        require: { types: './fixture-pkg.d.cts', default: './fixture-pkg.cjs' },
      },
    },
    ...overrides,
  });
}

async function makeRoot({ manifest: manifestJson = manifest(), declaration = DECLARATION } = {}) {
  const root = await mkdtemp(join(tmpdir(), 'lit-css-cjs-types-'));
  const pkgDir = join(root, 'packages', 'fixture-pkg');
  await mkdir(pkgDir, { recursive: true });
  await writeFile(join(pkgDir, 'package.json'), manifestJson);
  if (declaration !== null)
    await writeFile(join(pkgDir, 'fixture-pkg.d.ts'), declaration);
  return { root, pkgDir };
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

test('cjsTypes(): copies ESM declarations to .d.cts', async t => {
  const { root, pkgDir } = await makeRoot();
  try {
    const { errors } = await cjsTypes({ root });
    t.deepEqual(errors, [], 'no errors');
    const cjs = await readFile(join(pkgDir, 'fixture-pkg.d.cts'), 'utf8');
    t.match(cjs, /export declare function plugin\(\)/, 'declaration copied');
    const esm = await readFile(join(pkgDir, 'fixture-pkg.d.ts'), 'utf8');
    t.equal(esm, DECLARATION, 'ESM declaration untouched');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
  t.end();
});

test('cjsTypes(): rewrites ESM-only type imports in .d.cts only', async t => {
  const { root, pkgDir } = await makeRoot();
  try {
    const { errors } = await cjsTypes({ root });
    t.deepEqual(errors, [], 'no errors');
    const cjs = await readFile(join(pkgDir, 'fixture-pkg.d.cts'), 'utf8');
    t.ok(
      cjs.includes(`from 'vite' with { 'resolution-mode': 'import' }`),
      'import attribute added in .d.cts',
    );
    const esm = await readFile(join(pkgDir, 'fixture-pkg.d.ts'), 'utf8');
    t.notOk(esm.includes('resolution-mode'), 'ESM declaration untouched');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
  t.end();
});

test('cjsTypes(): reports a CJS build whose declarations are undeclared', async t => {
  const manifestJson = JSON.stringify({
    name: 'fixture-pkg',
    types: './fixture-pkg.d.ts',
    exports: {
      '.': {
        import: { types: './fixture-pkg.d.ts', default: './fixture-pkg.js' },
        require: { default: './fixture-pkg.cjs' },
      },
    },
  });
  const { root, pkgDir } = await makeRoot({ manifest: manifestJson });
  try {
    const { errors } = await cjsTypes({ root });
    t.equal(errors.length, 1, 'one error reported');
    t.match(errors[0], /require\.types is missing/, 'error names the missing entry');
    t.match(errors[0], /fixture-pkg/, 'error names the package');
    t.notOk(await exists(join(pkgDir, 'fixture-pkg.d.cts')), 'no .d.cts written');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
  t.end();
});

test('cjsTypes(): reports declarations missing instead of throwing ENOENT', async t => {
  const { root, pkgDir } = await makeRoot({ declaration: null });
  try {
    let result;
    try {
      result = await cjsTypes({ root });
    } catch (error) {
      t.fail(`cjsTypes threw: ${error.message}`);
      return;
    }
    t.equal(result.errors.length, 1, 'one error reported');
    t.match(result.errors[0], /declarations missing/i, 'error says declarations are missing');
    t.match(result.errors[0], /run `npm run build` first/, 'error says how to produce the declarations');
    t.notOk(await exists(join(pkgDir, 'fixture-pkg.d.cts')), 'no .d.cts written');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
  t.end();
});

test('cjsTypes(): ignores packages with no CommonJS build', async t => {
  const manifestJson = JSON.stringify({
    name: 'esm-only-pkg',
    types: './esm-only-pkg.d.ts',
    exports: { '.': { import: './esm-only-pkg.js' } },
  });
  const { root } = await makeRoot({ manifest: manifestJson });
  try {
    const { errors } = await cjsTypes({ root });
    t.deepEqual(errors, [], 'no errors for ESM-only package');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
  t.end();
});

test('cjsTypes(): filter limits the run to one package', async t => {
  const { root, pkgDir } = await makeRoot();
  const otherDir = join(root, 'packages', 'other-pkg');
  await mkdir(otherDir, { recursive: true });
  await writeFile(join(otherDir, 'package.json'), JSON.stringify({
    name: 'other-pkg',
    types: './other-pkg.d.ts',
    exports: {
      '.': {
        import: { types: './other-pkg.d.ts', default: './other-pkg.js' },
        require: { types: './other-pkg.d.cts', default: './other-pkg.cjs' },
      },
    },
  }));
  try {
    const { errors } = await cjsTypes({ root, filter: 'fixture-pkg' });
    t.deepEqual(errors, [], 'filtered-out package is not reported');
    t.ok(await exists(join(pkgDir, 'fixture-pkg.d.cts')), 'matching package copied');
    t.notOk(await exists(join(otherDir, 'other-pkg.d.cts')), 'filtered-out package untouched');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
  t.end();
});

test('cjsTypes(): a filter that matches nothing is an error', async t => {
  const { root } = await makeRoot();
  try {
    const { errors } = await cjsTypes({ root, filter: 'does-not-exist' });
    t.equal(errors.length, 1, 'one error reported');
    t.match(errors[0], /matched no packages/, 'error says the filter matched nothing');
    t.match(errors[0], /does-not-exist/, 'error names the filter');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
  t.end();
});

test('cjsTypes(): rewrites inline and re-exported ESM-only type imports', async t => {
  const declaration = `import { type Plugin } from 'vite';
export type { Plugin as VitePlugin } from 'vite';
import type { Inline } from 'vite';
export declare function plugin(): Plugin & Inline;
`;
  const { root, pkgDir } = await makeRoot({ declaration });
  try {
    const { errors } = await cjsTypes({ root });
    t.deepEqual(errors, [], 'no errors');
    const cjs = await readFile(join(pkgDir, 'fixture-pkg.d.cts'), 'utf8');
    const rewritten = cjs.match(/with \{ 'resolution-mode': 'import' \}/g) ?? [];
    t.equal(rewritten.length, 3, 'all three import forms rewritten');
    t.notOk(/\bfrom 'vite';/.test(cjs.replace(/'vite' with \{ 'resolution-mode': 'import' \}/g, '')), 'no bare vite import remains');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
  t.end();
});

test('cjsTypes(): does not double-apply the rewrite when run twice', async t => {
  const { root, pkgDir } = await makeRoot();
  try {
    await cjsTypes({ root });
    const { errors } = await cjsTypes({ root });
    t.deepEqual(errors, [], 'second run reports no errors');
    const cjs = await readFile(join(pkgDir, 'fixture-pkg.d.cts'), 'utf8');
    t.equal(cjs.match(/resolution-mode/g)?.length, 1, 'attribute applied exactly once');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
  t.end();
});

test('cjsTypes(): refuses to rewrite the ESM declaration in place', async t => {
  const shared = JSON.stringify({
    name: 'fixture-pkg',
    types: './fixture-pkg.d.ts',
    exports: {
      '.': {
        import: { types: './fixture-pkg.d.ts', default: './fixture-pkg.js' },
        require: { types: './fixture-pkg.d.ts', default: './fixture-pkg.cjs' },
      },
    },
  });
  const { root, pkgDir } = await makeRoot({ manifest: shared });
  try {
    const { errors } = await cjsTypes({ root });
    t.equal(errors.length, 1, 'one error reported');
    t.match(errors[0], /must differ|same path/i, 'error explains the shared path');
    const esm = await readFile(join(pkgDir, 'fixture-pkg.d.ts'), 'utf8');
    t.equal(esm, DECLARATION, 'ESM declaration untouched');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
  t.end();
});

test('cjsTypes(): reports string-form CJS conditions without declarations', async t => {
  const manifestJson = JSON.stringify({
    name: 'fixture-pkg',
    types: './fixture-pkg.d.ts',
    exports: { '.': { import: './fixture-pkg.js', require: './fixture-pkg.cjs' } },
  });
  const { root, pkgDir } = await makeRoot({ manifest: manifestJson });
  try {
    const { errors } = await cjsTypes({ root });
    t.equal(errors.length, 1, 'one error reported');
    t.match(errors[0], /require\.types is missing/, 'error names the missing entry');
    t.notOk(await exists(join(pkgDir, 'fixture-pkg.d.cts')), 'no .d.cts written');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
  t.end();
});

test('cjsTypes(): reports a require.types that is not the .d.cts twin', async t => {
  const manifestJson = JSON.stringify({
    name: 'fixture-pkg',
    types: './fixture-pkg.d.ts',
    exports: {
      '.': {
        import: { types: './fixture-pkg.d.ts', default: './fixture-pkg.js' },
        require: { types: './typo.d.cts', default: './fixture-pkg.cjs' },
      },
    },
  });
  const { root, pkgDir } = await makeRoot({ manifest: manifestJson });
  try {
    const { errors } = await cjsTypes({ root });
    t.equal(errors.length, 1, 'one error reported');
    t.match(errors[0], /is not the \.d\.cts twin/, 'error explains the naming mismatch');
    t.notOk(await exists(join(pkgDir, 'typo.d.cts')), 'no mismatched file written');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
  t.end();
});

test('conditionTarget(): accepts string and nested condition objects', t => {
  t.equal(conditionTarget('./x.js'), './x.js', 'string condition');
  t.equal(conditionTarget({ default: './x.js' }), './x.js', 'nested condition');
  t.equal(conditionTarget({ types: './x.d.ts', default: './x.js' }), './x.js', 'types-first nested condition');
  t.equal(conditionTarget(undefined), undefined, 'missing condition');
  t.end();
});
