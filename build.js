/* eslint-disable easy-loops/easy-loops */
import esbuild from 'esbuild';
import { globby } from 'globby';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';

const nativeNodeModulesPlugin = {
  name: 'native-node-modules',
  setup(build) {
    const require = createRequire(import.meta.url);
    // If a ".node" file is imported within a module in the "file" namespace, resolve
    // it to an absolute path and put it into the "node-file" virtual namespace.
    build.onResolve({ filter: /\.node$/, namespace: 'file' }, args => ({
      path: require.resolve(args.path, { paths: [args.resolveDir] }),
      namespace: 'node-file',
    }));

    // Files in the "node-file" virtual namespace call "require()" on the
    // path from esbuild of the ".node" file in the output directory.
    build.onLoad({ filter: /.*/, namespace: 'node-file' }, args => ({
      contents: `
        import path from ${JSON.stringify(args.path)}
        try { module.exports = require(path) }
        catch {}
      `,
    }));

    // If a ".node" file is imported within a module in the "node-file" namespace, put
    // it in the "file" namespace where esbuild's default loading behavior will handle
    // it. It is already an absolute path since we resolved it to one above.
    build.onResolve({ filter: /\.node$/, namespace: 'node-file' }, args => ({
      path: args.path,
      namespace: 'file',
    }));

    // Tell esbuild's default loading behavior to use the "file" loader for
    // these ".node" files.
    const opts = build.initialOptions;
    opts.loader = opts.loader || {};
    opts.loader['.node'] = 'file';
  },
};

export async function main() {
  for (const pkgPath of await globby('packages/*/package.json')) {
    const outdir = dirname(pkgPath);
    const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
    for (const [type, filename] of Object.entries(pkg.exports)) {
      try {
        await esbuild.build({
          bundle: type === 'require',
          external: type === 'require' ? ['fs', 'path', 'util', 'uglify-js', 'fsevents'] : [],
          entryPoints: [resolve(outdir, pkg.main).replace('.js', '.ts')],
          format: type === 'import' ? 'esm' : 'cjs',
          outfile: resolve(outdir, filename),
          sourcemap: true,
          target: type === 'import' ? 'es2020' : 'es2018',
          platform: 'node',
          plugins: [nativeNodeModulesPlugin],
        });
      } catch (e) {
        process.exit(1);
      }
    }
  }
}

main();
