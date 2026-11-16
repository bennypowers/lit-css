import { mkdtemp, mkdir, readdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { execa } from 'execa';
import test from 'tape';

import { EXPECTED } from './cjs-packages.js';

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoDir = join(pkgDir, '..', '..');
const tsc = join(repoDir, 'node_modules', '.bin', 'tsc');
const CONSUMER_MANIFEST = JSON.stringify({ name: 'consumer', type: 'commonjs', private: true });

/**
 * TypeScript statements that exercise the package's CommonJS entry the way its
 * consumers do. Fails to compile when `require()` is not callable or when a
 * named export is unreachable.
 * @param {string} name package name
 * @return {string} statements placed after `import pkg = require(name)`
 */
function cjsUsage(name) {
  const expected = EXPECTED[name];
  if (expected?.callable) {
    return /* ts */`
      const factory: (...args: any[]) => unknown = pkg;
      void factory;
    `;
  }
  return 'void pkg;';
}

/**
 * Creates a throwaway consumer project whose node_modules/<name>
 * symlinks to the given package directory in this repo.
 */
async function linkPackage(dir, sourceDir, name) {
  const target = join(dir, 'node_modules', name);
  await mkdir(dirname(target), { recursive: true });
  await symlink(sourceDir, target, 'dir');
}

/**
 * Creates a throwaway consumer project whose node_modules/@pwrs/lit-css
 * symlinks to the built package in this repo.
 */
async function makeConsumer(dir) {
  await linkPackage(dir, pkgDir, '@pwrs/lit-css');
  await writeFile(join(dir, 'package.json'), CONSUMER_MANIFEST);
  await writeFile(join(dir, 'index.ts'), /* ts */`
    import litCss = require('@pwrs/lit-css');
    const options: litCss.Options = { css: 'a { b: c }' };
    const css: Promise<string> = litCss.transform(options);
    export = css;
  `);
  await writeFile(join(dir, 'esm.mts'), /* ts */`
    import { transform, type Options } from '@pwrs/lit-css';
    const options: Options = { css: 'a { b: c }' };
    export async function css(): Promise<string> {
      return transform(options);
    }
  `);
}

async function typecheckWith(dir, name, compilerOptions, file) {
  await writeFile(join(dir, `${name}.json`), JSON.stringify({
    compilerOptions,
    files: [file],
  }));
  return execa(tsc, ['-p', join(dir, `${name}.json`)], { reject: false });
}

async function typecheck(dir, name, compilerOptions, file) {
  return typecheckWith(dir, name, {
    strict: true,
    noEmit: true,
    target: 'es2022',
    verbatimModuleSyntax: true,
    ...compilerOptions,
  }, file);
}

/**
 * Every workspace package that publishes a CommonJS declaration file.
 * Reads the manifests directly rather than hardcoding names, so new packages
 * are covered automatically.
 */
async function publishedPackages() {
  const packages = [];
  for (const dirent of await readdir(join(repoDir, 'packages'), { withFileTypes: true })) {
    if (!dirent.isDirectory())
      continue;
    const dir = join(repoDir, 'packages', dirent.name);
    let manifest;
    try {
      manifest = JSON.parse(await readFile(join(dir, 'package.json'), 'utf8'));
    } catch {
      continue;
    }
    const types = manifest.exports?.['.']?.require?.types;
    if (types)
      packages.push({ dir, manifest, name: manifest.name, types });
  }
  return packages;
}

test('@pwrs/lit-css types resolve for every consumer mode', async t => {
  const dir = await mkdtemp(join(repoDir, '.tmp-lit-css-types-'));
  try {
    await makeConsumer(dir);

    for (const [name, options, file] of [
      ['nodenext-cjs', { module: 'nodenext', moduleResolution: 'nodenext' }, 'index.ts'],
      ['nodenext-esm', { module: 'nodenext', moduleResolution: 'nodenext' }, 'esm.mts'],
      ['node16-cjs', { module: 'node16', moduleResolution: 'node16' }, 'index.ts'],
      ['bundler-esm', { module: 'esnext', moduleResolution: 'bundler' }, 'esm.mts'],
      ['node10-cjs', { module: 'commonjs', moduleResolution: 'node10' }, 'index.ts'],
    ]) {
      const result = await typecheck(dir, name, options, file);
      t.equal(result.exitCode, 0, `${name}: ${result.stderr || result.stdout || 'ok'}`);
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
  t.end();
});

test('every package publishes compilable CommonJS types', async t => {
  const packages = await publishedPackages();
  t.ok(packages.length > 0, 'found at least one package with require.types');

  const dir = await mkdtemp(join(repoDir, '.tmp-lit-css-cjs-types-'));
  try {
    await writeFile(join(dir, 'package.json'), CONSUMER_MANIFEST);

    for (const { dir: packageDir, name, types } of packages) {
      const safeName = name.replace(/[@/]/g, '-');
      await linkPackage(dir, packageDir, name);
      await writeFile(join(dir, `${safeName}.ts`), /* ts */`
        import pkg = require(${JSON.stringify(name)});
        ${cjsUsage(name)}
      `);

      const result = await typecheckWith(dir, `cjs-${safeName}`, {
        module: 'node16',
        moduleResolution: 'node16',
        strict: true,
        noEmit: true,
        // Load-bearing: TypeScript only validates the shipped `.d.cts` files,
        // and the vite-plugin declaration rewrite is invisible with
        // `skipLibCheck: true`. Do not flip this to true.
        skipLibCheck: false,
        target: 'es2022',
        lib: ['esnext', 'dom'],
        types: ['node'],
        typeRoots: [join(repoDir, 'node_modules', '@types')],
      }, `${safeName}.ts`);

      t.equal(result.exitCode, 0, `${name} (${types}): ${result.stderr || result.stdout || 'ok'}`);
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
  t.end();
});

/**
 * Read the file list out of `npm pack --json` output.
 * npm <= 11 prints an array of pack results; npm >= 12 prints an object keyed
 * by package name. Accept both so the check works on any npm the runner has.
 * @param {string} output raw stdout from `npm pack --dry-run --json`
 * @return {Array<{path: string}>} packed file entries
 */
function packedFiles(output) {
  const parsed = JSON.parse(output);
  const results = Array.isArray(parsed) ? parsed : Object.values(parsed);
  if (results.length !== 1 || !Array.isArray(results[0]?.files))
    throw new Error(`unexpected npm pack --json shape: ${output}`);
  return results[0].files;
}

test('packedFiles() accepts both npm pack --json output shapes', async t => {
  const files = [{ path: 'package.json', size: 1, mode: 420 }];
  const result = { name: 'pkg', files };
  t.deepEqual(packedFiles(JSON.stringify([result])), files, 'npm <= 11 array shape');
  t.deepEqual(packedFiles(JSON.stringify({ pkg: result })), files, 'npm >= 12 object shape');
  t.throws(() => packedFiles(JSON.stringify({})), /unexpected npm pack/, 'rejects empty object');
  t.throws(
    () => packedFiles(JSON.stringify([{ name: 'pkg' }])),
    /unexpected npm pack/,
    'rejects result without files',
  );
  t.end();
});

test('every package tarball contains its CommonJS types', async t => {
  for (const { dir, name, types } of await publishedPackages()) {
    const result = await execa('npm', ['pack', '--dry-run', '--json'], { cwd: dir, reject: false });
    const description = `${name} tarball ${result.stderr || result.stdout || 'ok'}`;
    if (result.exitCode !== 0) {
      t.fail(description);
      continue;
    }

    let files;
    try {
      files = packedFiles(result.stdout);
    } catch {
      t.fail(`${name}: could not parse npm pack output: ${result.stdout}`);
      continue;
    }

    const expected = types.replace(/^\.\//, '');
    t.ok(
      files.some(file => file.path.replace(/^\.\//, '') === expected),
      `${name} tarball contains ${types}`,
    );
  }
  t.end();
});
