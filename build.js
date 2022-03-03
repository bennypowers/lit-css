/* eslint-disable easy-loops/easy-loops */
import esbuild from 'esbuild';
import { globby } from 'globby';
import { readFile } from 'fs/promises';
import { dirname, resolve } from 'path';

const sourcemap = true;

export async function main() {
  for (const pkgPath of await globby('packages/*/package.json')) {
    const outdir = dirname(pkgPath);
    const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
    for (const [type, filename] of Object.entries(pkg.exports)) {
      const outfile = resolve(outdir, filename);
      const format = type === 'import' ? 'esm' : 'cjs';
      const target = type === 'import' ? 'es2020' : 'es2015';
      const bundle = type === 'require';
      const external = bundle ? ['fs', 'path', 'util'] : [];
      const entryPoints = [resolve(outdir, pkg.main).replace('.js', '.ts')];
      try {
        await esbuild.build({
          bundle,
          external,
          entryPoints,
          format,
          outfile,
          sourcemap,
          target,
          platform: 'node',
        });
      } catch (e) {
        process.exit(1);
      }
    }
  }
}

main();
