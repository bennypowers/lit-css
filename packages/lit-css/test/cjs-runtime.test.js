import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import test from 'tape';

import { cjsPackages, EXPECTED } from './cjs-packages.js';

const require = createRequire(import.meta.url);
const pkgDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoDir = join(pkgDir, '..', '..');

test('every package CommonJS entry can be required at runtime', async t => {
  const packages = await cjsPackages(repoDir);
  t.ok(packages.length > 0, 'found at least one package with a require entry');
  t.deepEqual(
    packages.map(({ name }) => name).sort(),
    Object.keys(EXPECTED).sort(),
    'every package with a require entry has an expectation',
  );

  for (const { name, target } of packages) {
    const expected = EXPECTED[name];
    if (!expected)
      continue;

    let mod;
    try {
      mod = require(name);
    } catch (error) {
      t.fail(`${name} (${target}): require threw: ${error.message}`);
      continue;
    }

    if (expected.named)
      t.equal(typeof mod[expected.named], 'function', `${name}: exposes ${expected.named}()`);
    else if (expected.callable) {
      t.equal(typeof mod, 'function', `${name}: require() returns the factory`);
      t.equal(mod.default, mod, `${name}: default points back at the factory`);
    } else if (expected.value) {
      t.ok(Symbol.for('parcel-plugin-config') in mod, `${name}: require() returns the transformer`);
      t.equal(mod.default, mod, `${name}: default points back at the transformer`);
    }
  }
  t.end();
});
