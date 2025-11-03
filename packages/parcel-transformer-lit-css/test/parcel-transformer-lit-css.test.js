import { Parcel } from '@parcel/core';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtemp, writeFile, rm, symlink, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';

import { run } from '@lit-css/test/test.js';

const dir = dirname(fileURLToPath(import.meta.url));

const FIXTURES_DIR = join(dir, '..', '..', '..', 'test', '😁-FIXTURES');

run({
  dir,
  name: 'parcel-transformer-lit-css',
  async getCode(path, { options, alias } = {}) {
    const input = resolve(FIXTURES_DIR, path);
    const tmpDir = await mkdtemp(join(tmpdir(), 'parcel-lit-css-'));

    try {
      // Symlink root node_modules to tmpDir (contains all dependencies including @parcel)
      const rootNodeModules = resolve(dir, '..', '..', '..', 'node_modules');
      const nodeModulesLink = join(tmpDir, 'node_modules');
      await symlink(rootNodeModules, nodeModulesLink, 'dir');

      // Create .parcelrc configuration
      const parcelrcPath = join(tmpDir, '.parcelrc');
      // Copy the transformer to tmpDir to make it locally resolvable
      const localTransformerPath = join(tmpDir, 'transformer.js');
      const transformerSource = await readFile(resolve(dir, '..', 'parcel-transformer-lit-css.js'), 'utf-8');
      await writeFile(localTransformerPath, transformerSource);

      const parcelrc = {
        extends: '@parcel/config-default',
        transformers: {
          '*.css': ['./transformer.js'],
        },
      };

      await writeFile(parcelrcPath, JSON.stringify(parcelrc, null, 2));

      // Create a package.json for parcel options
      const packageJsonPath = join(tmpDir, 'package.json');
      const packageJson = {
        name: 'parcel-lit-css-test',
        ...(options && { 'lit-css': options }),
        ...(alias && { alias }),
      };
      await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

      // Build with Parcel
      const distDir = join(tmpDir, 'dist');
      const bundler = new Parcel({
        entries: input,
        config: parcelrcPath,
        mode: 'production',
        targets: {
          default: {
            distDir,
            outputFormat: 'esmodule',
            isLibrary: true,
            optimize: false,
            scopeHoist: true, // Enable for ES module output
            sourceMap: false,
          },
        },
      });

      let result;
      try {
        result = await bundler.run();
      } catch (error) {
        console.error('Parcel build error:', error);
        if (error.diagnostics) {
          error.diagnostics.forEach(d => {
            console.error('Diagnostic:', d);
            if (d.codeFrames)
              d.codeFrames.forEach(cf => console.error('CodeFrame:', cf));
          });
        }
        throw error;
      }

      const { bundleGraph } = result;
      const bundles = bundleGraph.getBundles();

      if (bundles.length === 0)
        throw new Error('No bundles found in build output');


      // Get the main bundle
      const bundle = bundles.find(b => b.type === 'js') || bundles[0];

      // Read the bundle contents from the file system
      const bundlePath = join(tmpDir, 'dist', bundle.name);
      const code = await readFile(bundlePath, 'utf-8');

      return code;
    } finally {
      // Cleanup temp directory
      await rm(tmpDir, { recursive: true, force: true });
    }
  },
});
