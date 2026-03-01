import type { Loader, Plugin } from 'esbuild';
import type { Options } from '@pwrs/lit-css/lit-css';
import { transform, toTaggedTemplateLiteral } from '@pwrs/lit-css';
import { readFile } from 'node:fs/promises';
import { init, parse } from 'es-module-lexer';
import { dirname, resolve, extname } from 'node:path';

export interface LitCSSOptions extends Omit<Options, 'css'> {
  filter: RegExp;
  /** When true, inline CSS into the importing JS/TS module instead of creating separate modules. */
  inline?: boolean;
}

const LOADER_MAP: Record<string, Loader> = {
  '.js': 'js',
  '.mjs': 'js',
  '.cjs': 'js',
  '.jsx': 'jsx',
  '.ts': 'ts',
  '.mts': 'ts',
  '.cts': 'ts',
  '.tsx': 'tsx',
};

export function litCssPlugin(options?: LitCSSOptions): Plugin {
  const {
    filter = /\.css$/,
    specifier = 'lit',
    tag = 'css',
    inline = false,
    ...rest
  } = options ?? {};
  return {
    name: 'lit-css',
    setup(build) {
      if (inline) {
        build.onLoad({ filter: /\.[cm]?[jt]sx?$/ }, async args => {
          const source = await readFile(args.path, 'utf8');

          await init;
          const [imports] = parse(source);

          // find CSS imports matching the filter
          const cssImports = imports.filter(imp =>
            imp.n && filter.test(imp.n)
          );

          if (!cssImports.length)
            return undefined; // let esbuild handle normally

          let contents = source;
          const dir = dirname(args.path);

          // deduplicate CSS reads by resolved path
          const cssCache = new Map<string, Promise<string>>();
          function getTaggedTL(resolvedPath: string): Promise<string> {
            let cached = cssCache.get(resolvedPath);
            if (!cached) {
              cached = readFile(resolvedPath, 'utf8').then(css =>
                toTaggedTemplateLiteral({ css, filePath: resolvedPath, tag, ...rest })
              );
              cssCache.set(resolvedPath, cached);
            }
            return cached;
          }

          // process in reverse order to preserve string offsets
          const sorted = [...cssImports].sort((a, b) => b.ss - a.ss);

          for (const imp of sorted) {
            const resolvedPath = resolve(dir, imp.n);
            const taggedTL = await getTaggedTL(resolvedPath);
            const statement = contents.slice(imp.ss, imp.se);

            let replacement: string;

            // export { default } from './styles.css'
            // export { X } from './styles.css'
            const reExportMatch = statement.match(
              /^export\s*\{([^}]+)\}\s*from\s*/
            );
            if (reExportMatch) {
              const bindings = reExportMatch[1]
                .split(',')
                .map(b => b.trim())
                .filter(Boolean);

              const parts: string[] = [];
              const exportParts: string[] = [];

              for (const binding of bindings) {
                const aliasMatch = binding.match(/^(\S+)\s+as\s+(\S+)$/);
                const imported = aliasMatch ? aliasMatch[1] : binding;
                const exported = aliasMatch ? aliasMatch[2] : binding;

                if (imported === 'default') {
                  const varName = exported === 'default' ? '_styles' : exported;
                  parts.push(`const ${varName} = ${taggedTL}`);
                  exportParts.push(
                    varName === exported ? exported : `${varName} as ${exported}`
                  );
                } else {
                  // e.g. export { styles } from './styles.css'
                  const varName = exported === imported ? imported : `_${exported}`;
                  parts.push(`const ${varName} = ${taggedTL}`);
                  exportParts.push(
                    varName === exported ? exported : `${varName} as ${exported}`
                  );
                }
              }
              replacement = `${parts.join(';\n')};\nexport { ${exportParts.join(', ')} }`;
            } else {
              // import X from './styles.css'
              // import { styles } from './styles.css'
              const defaultImportMatch = statement.match(
                /^import\s+(\w+)\s+from\s*/
              );
              const namedImportMatch = statement.match(
                /^import\s*\{([^}]+)\}\s*from\s*/
              );

              if (defaultImportMatch) {
                const varName = defaultImportMatch[1];
                replacement = `const ${varName} = ${taggedTL}`;
              } else if (namedImportMatch) {
                const bindings = namedImportMatch[1]
                  .split(',')
                  .map(b => b.trim())
                  .filter(Boolean);
                const parts: string[] = [];
                for (const binding of bindings) {
                  const aliasMatch = binding.match(/^(\S+)\s+as\s+(\S+)$/);
                  const localName = aliasMatch ? aliasMatch[2] : binding;
                  parts.push(`const ${localName} = ${taggedTL}`);
                }
                replacement = parts.join(';\n');
              } else {
                // side-effect import or unrecognized pattern — skip
                continue;
              }
            }

            contents =
              contents.slice(0, imp.ss) +
              replacement +
              contents.slice(imp.se);
          }

          // inject tag import at the top if not already present
          const tagImport = `import {${tag}} from '${specifier}';\n`;
          if (!contents.includes(tagImport) && !contents.includes(`{${tag}}`))
            contents = tagImport + contents;

          const ext = extname(args.path);
          const loader = LOADER_MAP[ext] ?? 'js';
          return { contents, loader };
        });
      } else {
        build.onLoad({ filter }, async args => {
          const css = await readFile(args.path, 'utf8');
          const filePath = args.path;
          try {
            const contents = await transform({ css, specifier, tag, filePath, ...rest });
            return { contents, loader: 'js' };
          } catch (error) {
            return {
              errors: [{
                text: error.message,
                detail: error,
                location: {
                  file: error.file,
                  line: error.line,
                  column: error.column,
                },
              }],
            };
          }
        });
      }
    },
  };
}
