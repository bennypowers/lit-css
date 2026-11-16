import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { execa } from 'execa';
import test from 'tape';

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoDir = join(pkgDir, '..', '..');
const tsc = join(repoDir, 'node_modules', '.bin', 'tsc');

test('@pwrs/lit-css sources typecheck under strict', async t => {
  const result = await execa(tsc, [
    '--noEmit',
    '--strict',
    '--target', 'es2022',
    '--module', 'es2022',
    '--moduleResolution', 'bundler',
    '--lib', 'esnext',
    '--types', 'node',
    '--typeRoots', join(repoDir, 'node_modules', '@types'),
    join(pkgDir, 'lit-css.ts'),
  ], { reject: false });
  t.equal(result.exitCode, 0, `strict: ${result.stderr || result.stdout || 'ok'}`);
  t.end();
});
