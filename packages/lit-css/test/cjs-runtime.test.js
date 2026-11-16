import { readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import test from 'tape';

const require = createRequire(import.meta.url);
const pkgDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoDir = join(pkgDir, '..', '..');

/**
 * Every workspace package that publishes a CommonJS entry point.
 * Reads the manifests directly rather than hardcoding names, so new packages
 * are covered automatically.
 */
async function cjsPackages() {
  const packages = [];
  for (const dirent of await readdir(join(repoDir, 'packages'), { withFileTypes: true })) {
    if (!dirent.isDirectory())
      continue;
    let manifest;
    try {
      const manifestPath = join(repoDir, 'packages', dirent.name, 'package.json');
      manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    } catch {
      continue;
    }
    const target = manifest.exports?.['.']?.require?.default;
    if (target)
      packages.push({ name: manifest.name, target });
  }
  return packages;
}

test('every package CommonJS entry can be required at runtime', async t => {
  const packages = await cjsPackages();
  t.ok(packages.length > 0, 'found at least one package with a require entry');

  for (const { name, target } of packages) {
    let mod;
    try {
      mod = require(name);
    } catch (error) {
      t.fail(`${name} (${target}): require threw: ${error.message}`);
      continue;
    }

    t.equal(typeof mod, 'object', `${name}: require returns a module object`);
    t.ok(Object.keys(mod).length > 0, `${name}: exposes at least one export`);
  }
  t.end();
});
