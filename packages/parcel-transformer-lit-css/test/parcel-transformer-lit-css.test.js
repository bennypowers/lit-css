/* eslint-disable no-console */
import { Parcel } from '@parcel/core';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtemp, writeFile, rm, symlink, readFile, mkdir, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';

import { run } from '@lit-css/test/test.js';

const dir = dirname(fileURLToPath(import.meta.url));

const FIXTURES_DIR = join(dir, '..', '..', '..', 'test', '😁-FIXTURES');

run({
  dir,
  name: 'parcel-transformer-lit-css',
  // Skip transform callback tests - Parcel uses its own transformer chain instead
  skip: ['scss-transform', 'scss-error', 'postcss-transform'],
  async getCode(path, { options, alias } = {}) {
    const tmpDir = await mkdtemp(join(tmpdir(), 'parcel-lit-css-'));

    try {
      // Symlink root node_modules to tmpDir (contains all dependencies including @parcel and mock packages)
      const rootNodeModules = resolve(dir, '..', '..', '..', 'node_modules');
      const nodeModulesLink = join(tmpDir, 'node_modules');
      await symlink(rootNodeModules, nodeModulesLink, 'dir');

      // Copy the specific fixture subdirectory to tmpDir
      const fixtureName = path.split('/')[0]; // e.g., 'basic' from 'basic/input.js'
      const fixtureSourceDir = join(FIXTURES_DIR, fixtureName);
      const fixtureDestDir = join(tmpDir, fixtureName);
      await cp(fixtureSourceDir, fixtureDestDir, { recursive: true });

      // Entry point will be in the copied fixture
      const input = join(tmpDir, path);

      // Create .parcelrc configuration
      const parcelrcPath = join(tmpDir, '.parcelrc');
      // Copy the transformer to tmpDir to make it locally resolvable
      const localTransformerPath = join(tmpDir, 'transformer.js');
      const transformerSource =
        await readFile(resolve(dir, '..', 'parcel-transformer-lit-css.js'), 'utf-8');
      await writeFile(localTransformerPath, transformerSource);

      const parcelrc = {
        extends: '@parcel/config-default',
        transformers: {
          '*.css': ['./transformer.js'],
          '*.scss': ['@parcel/transformer-sass', './transformer.js'],
        },
      };

      await writeFile(parcelrcPath, JSON.stringify(parcelrc, null, 2));

      // Create a package.json for parcel options
      const packageJsonPath = join(tmpDir, 'package.json');

      // Convert alias paths to be relative to the fixture directory
      // Parcel resolves aliases relative to the package.json location
      const resolvedAlias = alias ? Object.fromEntries(
        Object.entries(alias).map(([key, value]) => [
          key,
          `./${fixtureName}/${value.replace('./', '')}`
        ])
      ) : undefined;

      const packageJson = {
        name: 'parcel-lit-css-test',
        ...(options && { 'lit-css': options }),
        ...(resolvedAlias && { alias: resolvedAlias }),
      };
      await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

      // Build with Parcel
      const distDir = join(tmpDir, 'dist');

      // Change to tmpDir so relative paths work
      const originalCwd = process.cwd();
      process.chdir(tmpDir);

      const bundler = new Parcel({
        entries: path,  // Now relative to tmpDir
        config: parcelrcPath,
        defaultConfig: '@parcel/config-default',
        mode: 'production',
        targets: {
          default: {
            distDir,
            outputFormat: 'esmodule',
            isLibrary: true,
            optimize: false,
            scopeHoist: false,
            sourceMap: false,
          },
        },
      });

      let result;
      try {
        result = await bundler.run();
      } catch (error) {
        // Normalize paths in Parcel BuildError diagnostics
        if (error.diagnostics) {
          error.diagnostics.forEach(d => {
            if (d.message) {
              d.message = d.message.replace(
                new RegExp(`${fixtureName}/`, 'g'),
                `test/😁-FIXTURES/${fixtureName}/`
              );
            }
          });
        }

        // Also normalize the main error message
        if (error.message) {
          error.message = error.message.replace(
            new RegExp(`${fixtureName}/`, 'g'),
            `test/😁-FIXTURES/${fixtureName}/`
          );
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

      // Parcel bundles everything with its module runtime.
      // Extract just the CSS content to verify the transformation.
      // The pattern in the bundle is: (0, _lit.css)(t || (t = _`CSS_HERE`));
      // or (0, _fastElement.css)(t || (t = _`CSS_HERE`));
      // or (0, _snoot.boop)(t || (t = _`CSS_HERE`)); for custom tag/specifier
      // or in integration tests: (0, _lit.css)`CSS_HERE`
      const cssMatch = code.match(/\(0, _(\w+)\.(css|boop)\)\(t \|\| \(t = _`([\s\S]*?)`\)\);/)
                    || code.match(/\(0, _(\w+)\.(css|boop)\)`([\s\S]*?)`/);

      if (!cssMatch) {
        // If we can't extract the CSS, return the full code for debugging
        console.warn('Could not extract CSS from Parcel bundle');
        return code;
      }

      // Determine which library and tag are being used based on the variable name
      const libName = cssMatch[1];
      const tag = cssMatch[2];
      let importSource, importTag;

      if (libName === 'fastElement') {
        importSource = '@microsoft/fast-element';
        importTag = 'css';
      } else if (libName === 'snoot') {
        importSource = 'snoot';
        importTag = 'boop';
      } else {
        importSource = 'lit';
        importTag = 'css';
      }

      const cssContent = cssMatch[3];

      // Reconstruct a simplified ES module format for comparison
      const simplifiedOutput = `import { ${importTag} } from "${importSource}";\nconst styles = ${importTag}\`${cssContent}\`;\nexport {\n  styles as default,\n  styles\n};\n`;

      return simplifiedOutput;
    } catch (error) {
      // Errors from pre-processing (if any) would be caught here
      // Re-throw to be handled by the test
      throw error;
    } finally {
      // Restore original working directory
      if (typeof originalCwd !== 'undefined')
        process.chdir(originalCwd);

      // Cleanup temp directory (do this async without awaiting to avoid interfering with error propagation)
      rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  },
});

// Note: SCSS and PostCSS support is demonstrated through Parcel's transformer chain
// configuration in the main test (see .parcelrc setup above). The transform callback
// tests are skipped for Parcel because users should use Parcel's built-in transformers:
// - For SCSS: ["@parcel/transformer-sass", "parcel-transformer-lit-css"]
// - For PostCSS: ["@parcel/transformer-postcss", "parcel-transformer-lit-css"]
