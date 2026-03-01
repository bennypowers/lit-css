import type { Loader, Plugin, PluginBuild } from 'esbuild';
import type { Options } from '@pwrs/lit-css/lit-css';
import type { ImportSpecifier } from 'es-module-lexer';
import { transform, toTaggedTemplateLiteral } from '@pwrs/lit-css';
import { readFile } from 'node:fs/promises';
import { init, parse } from 'es-module-lexer';
import { dirname, extname } from 'node:path';

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

function reExportBinding(binding: string, taggedTL: string): { part: string; exportPart: string } {
  const aliasMatch = binding.match(/^(\S+)\s+as\s+(\S+)$/);
  const imported = aliasMatch ? aliasMatch[1] : binding;
  const exported = aliasMatch ? aliasMatch[2] : binding;
  const varName =
      imported === 'default' ? (exported === 'default' ? '_styles' : exported)
    : exported === imported ? imported
    : `_${exported}`;
  return {
    part: `const ${varName} = ${taggedTL}`,
    exportPart: varName === exported ? exported : `${varName} as ${exported}`,
  };
}

function replaceStatement(statement: string, taggedTL: string): string | undefined {
  // export { default } from './styles.css'
  // export { X } from './styles.css'
  const reExportMatch = statement.match(/^export\s*\{([^}]+)\}\s*from\s*/);
  if (reExportMatch) {
    const results = reExportMatch[1].split(',').map(b => b.trim()).filter(Boolean)
      .map(binding => reExportBinding(binding, taggedTL));
    return `${results.map(r => r.part).join(';\n')};\nexport { ${results.map(r => r.exportPart).join(', ')} }`;
  }

  // import X from './styles.css'
  const defaultImportMatch = statement.match(/^import\s+(\w+)\s+from\s*/);
  if (defaultImportMatch) {
    const [, varName] = defaultImportMatch;
    return `const ${varName} = ${taggedTL}`;
  }

  // import { styles } from './styles.css'
  const namedImportMatch = statement.match(/^import\s*\{([^}]+)\}\s*from\s*/);
  if (namedImportMatch) {
    return namedImportMatch[1].split(',').map(b => b.trim()).filter(Boolean)
      .map(binding => {
        const aliasMatch = binding.match(/^(\S+)\s+as\s+(\S+)$/);
        const localName = aliasMatch ? aliasMatch[2] : binding;
        return `const ${localName} = ${taggedTL}`;
      })
      .join(';\n');
  }

  // side-effect import or unrecognized pattern
  return undefined;
}

async function replaceImport(
  imp: ImportSpecifier,
  contents: string,
  importer: string,
  build: PluginBuild,
  getTaggedTL: (resolvedPath: string) => Promise<string>,
): Promise<string> {
  const resolved = await build.resolve(imp.n, {
    importer,
    resolveDir: dirname(importer),
    kind: 'import-statement',
  });
  const taggedTL = await getTaggedTL(resolved.path);
  const replacement = replaceStatement(contents.slice(imp.ss, imp.se), taggedTL);
  if (replacement == null)
    return contents;
  return contents.slice(0, imp.ss) + replacement + contents.slice(imp.se);
}

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

          let imports;
          try {
            [imports] = parse(source);
          } catch {
            return undefined; // let esbuild handle normally
          }

          // find CSS imports matching the filter
          const cssImports = imports.filter(imp =>
            imp.n && filter.test(imp.n)
          );

          if (!cssImports.length)
            return undefined; // let esbuild handle normally

          // check whether the tag is already imported from the specifier
          const alreadyImported = imports.some(imp =>
            imp.n === specifier
          );

          let contents = source;

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

          for (const imp of sorted)
            contents = await replaceImport(imp, contents, args.path, build, getTaggedTL);

          // inject tag import at the top if not already present
          if (!alreadyImported)
            contents = `import {${tag}} from '${specifier}';\n${contents}`;

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
