import type { Plugin } from 'vite';
import type { Options } from '@pwrs/lit-css/lit-css';

import { createFilter, type FilterPattern } from '@rollup/pluginutils';
import { transform } from '@pwrs/lit-css';
import { readFile } from 'node:fs/promises';

export interface LitCSSOptions extends Omit<Options, 'css'> {
  /**
   * Files to include for transformation
   * @default /\.css$/i
   */
  include?: FilterPattern;
  /**
   * Files to exclude from transformation
   */
  exclude?: FilterPattern;
}

/**
 * Vite plugin to import CSS files as tagged template literals
 *
 * @param options - Plugin configuration options
 * @returns Vite plugin
 */
export function litCSS(options?: LitCSSOptions): Plugin {
  const {
    exclude,
    include = /\.css$/i,
    specifier,
    tag,
    ...rest
  } = options ?? {};

  const filter = createFilter(include, exclude);

  return {
    name: 'vite-plugin-lit-css',
    enforce: 'pre', // Run before Vite's built-in CSS plugin

    async resolveId(source, importer, options) {
      // Don't process external imports
      if (!importer) return null;

      // Quick check: only process potential CSS-like files
      // This is just a performance optimization - the filter does the real check
      if (!source.endsWith('.css') && !source.endsWith('.scss') && !source.endsWith('.sass') &&
          !source.endsWith('.less') && !source.endsWith('.styl')) {
        return null;
      }

      // Let other plugins (alias, etc.) resolve the import first
      // This handles bare specifiers, relative paths, and absolute paths
      const resolution = await this.resolve(source, importer, {
        skipSelf: true,  // Don't call ourselves recursively
        ...options,
      });

      // If resolution failed or is marked external, let other plugins handle it
      if (!resolution || resolution.external) return null;

      // Now check if the RESOLVED path matches our filter
      if (filter(resolution.id)) {
        // Return with .js extension so Rollup treats it as JavaScript
        // We use \0 prefix to mark this as a virtual module
        return '\0' + resolution.id + '.lit-css.js';
      }

      return null;
    },

    async load(id) {
      // Check if this is one of our virtual modules
      if (!id.includes('.lit-css.js')) return null;

      // Extract the original CSS file path (remove \0 prefix and .lit-css.js suffix)
      const cleanId = id.replace(/^\0/, '').replace(/\.lit-css\.js$/, '');

      try {
        const css = await readFile(cleanId, 'utf8');
        const code = await transform({ css, specifier, tag, filePath: cleanId, ...rest });
        return {
          code,
          map: { mappings: '' },
        };
      } catch (error: any) {
        this.error(error?.message ?? String(error));
      }
    },
  };
}

export default litCSS;
