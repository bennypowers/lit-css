import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * How each package's CommonJS entry should be consumed.
 *
 * `callable`: `require(name)` is the plugin factory itself, and still carries
 * its named exports and a `default` property pointing back at itself.
 * `value`: default export is not callable (a Parcel transformer instance); it
 * is exposed directly.
 * `named`: no default export.
 */
export const EXPECTED = {
  '@pwrs/lit-css': { named: 'transform' },
  'esbuild-plugin-lit-css': { named: 'litCssPlugin' },
  'esbuild-plugin-minify-html-literals': { named: 'minifyHTMLLiteralsPlugin' },
  'rollup-plugin-lit-css': { callable: true },
  'lit-css-loader': { callable: true },
  'web-dev-server-plugin-lit-css': { callable: true },
  'typescript-transform-lit-css': { callable: true },
  '@pwrs/vite-plugin-lit-css': { callable: true },
  'parcel-transformer-lit-css': { value: true },
};

/**
 * Every workspace package that publishes a CommonJS entry point.
 * Reads the manifests directly rather than hardcoding names, so new packages
 * are covered automatically.
 */
export async function cjsPackages(repoDir) {
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
