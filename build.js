import esbuild from 'esbuild';
import { globby } from 'globby';
import { readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

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

/**
 * Resolve an exports condition to the file it points at.
 * Conditions may be a plain string or an object of nested conditions whose
 * `default` is the runtime target.
 */
export function conditionTarget(condition) {
  return typeof condition === 'string' ? condition : condition?.default;
}

/**
 * Packages that build and typecheck themselves from their own scripts
 * (`build:esm` / `build:cjs`) and are excluded from the root tsconfig, which
 * keeps the root program from emitting a second copy of their declarations.
 */
const SELF_BUILT_PACKAGES = new Set(['typescript-transform-lit-css']);

/**
 * Build runtime bundles for every package, or only for `filter`.
 *
 * `filter` scopes the run to one package (by name or directory basename), which
 * the self-built packages use to build their own bundles with the same esbuild
 * settings (including the CJS interop footer) as the rest of the workspace.
 */
export async function main({ root = dirname(fileURLToPath(import.meta.url)), filter } = {}) {
  for (const pkgPath of await globby('packages/*/package.json', { cwd: root, absolute: true })) {
    const outdir = dirname(pkgPath);
    const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
    if (filter && pkg.name !== filter && basename(outdir) !== filter)
      continue;
    if (!filter && [...SELF_BUILT_PACKAGES].some(name => basename(outdir) === name))
      continue;
    const entry = pkg.exports['.'] ?? pkg.exports;
    for (const type of ['import', 'require']) {
      const filename = conditionTarget(entry[type]);
      if (!filename)
        continue;
      try {
        await esbuild.build({
          bundle: type === 'require',
          external: type === 'require' ? [
            'fs',
            'path',
            'util',
            'fsevents',
            'clean-css',
            'postcss',
            'postcss-*',
            'node:*',
            '@pwrs/lit-css',
            // Bundling this drags uglify-js into the output, and uglify-js
            // resolves its own lib files with require.resolve('../lib/*.js'),
            // which cannot work from inside a bundle.
            'minify-html-literals',
          ] : [],
          entryPoints: [resolve(outdir, pkg.main).replace('.js', '.ts')],
          format: type === 'import' ? 'esm' : 'cjs',
          outfile: resolve(outdir, filename),
          sourcemap: true,
          footer: type === 'require' ? { js: CJS_INTEROP_FOOTER } : undefined,
          target: type === 'import' ? 'es2020' : 'es2018',
          platform: 'node',
          plugins: [nativeNodeModulesPlugin],
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        process.exitCode = 1;
      }
    }
  }
}

/**
 * Packages that publish types only through the ESM `import` condition.
 *
 * A copied `.d.cts` resolves `import type ... from '<dep>'` through `<dep>`'s
 * `require` condition. When that condition has no useful named types (vite's
 * `index.d.cts` is `declare const module: any; export = module`), the import
 * fails with TS2305. Rewriting just those specifiers with an import attribute
 * forces TypeScript to resolve them as ESM while keeping the declaring file CJS.
 *
 * Caveat: import attributes need TypeScript >= 5.3 to parse. Non-strict
 * projects on TS 4.7-5.2 previously got no error here (implicit any) and now
 * get a syntax error, so `@pwrs/vite-plugin-lit-css` effectively requires
 * TypeScript >= 5.3 for CommonJS consumers.
 */
/**
 * Make `require()` return the default export of an esbuild CJS bundle.
 *
 * esbuild always emits `{ default, ...named }`. For packages whose default
 * export is the plugin factory, CJS consumers expect `require('pkg')` to be
 * callable (or, for object defaults, to be the object itself). The footer moves
 * the default to `module.exports` and re-attaches the named exports, including
 * `default`, so both spellings keep working.
 */
const CJS_INTEROP_FOOTER = `
if (module.exports && typeof module.exports === 'object' && 'default' in module.exports) {
  var named = module.exports;
  var def = named.default;
  if (def && (typeof def === 'function' || typeof def === 'object')) {
    module.exports = Object.assign(def, named);
    module.exports.default = def;
  }
}
`;

const DECLARATION_NAME = new RegExp(String.raw`^(?:export\s+)?(?:declare\s+)?` +
  String.raw`(interface|type|function|const|class)\s+([A-Za-z_$][\w$]*)`);
const DEFAULT_IDENTIFIER = /^export default ([A-Za-z_$][\w$]*);\s*$/;
const DEFAULT_ANONYMOUS_FUNCTION = /^export default function(?:\s+([A-Za-z_$][\w$]*))?\s*\(/;
const ANONYMOUS_DEFAULT_NAME = 'defaultExport';
const MERGEABLE_WITH_NAMESPACE = new Set(['function', 'class']);

/**
 * Rewrite a `.d.ts` that has a default export into a CommonJS declaration.
 *
 * Exported declarations lose their `export` modifier, their names are
 * re-exported from a namespace merged with the default value, and the module
 * ends with `export =`. When the default is a function (or class), the
 * namespace also exports it as `default`, so `.default` remains typed for
 * consumers that already use it. A `const` default cannot merge with a
 * namespace, so only type names are re-exported and `.default` is runtime-only.
 * @param {string} source declaration file contents
 * @return {string} contents for the matching `.d.cts`
 */
export function toCommonJsDeclaration(source) {
  const declarations = new Map();
  const exportedNames = [];
  const lines = [];
  let defaultValue;

  for (const line of source.split('\n')) {
    const identifier = DEFAULT_IDENTIFIER.exec(line);
    if (identifier) {
      [, defaultValue] = identifier;
      continue;
    }

    const anonymousFunction = DEFAULT_ANONYMOUS_FUNCTION.exec(line);
    if (anonymousFunction) {
      defaultValue = anonymousFunction[1] ?? ANONYMOUS_DEFAULT_NAME;
      declarations.set(defaultValue, 'function');
      lines.push(line.replace(
        DEFAULT_ANONYMOUS_FUNCTION,
        `declare function ${defaultValue}(`,
      ));
      continue;
    }

    const declaration = DECLARATION_NAME.exec(line);
    if (declaration)
      declarations.set(declaration[2], declaration[1]);
    if (line.startsWith('export ')) {
      if (declaration)
        exportedNames.push(declaration[2]);
      lines.push(line.replace(/^export\s+/, ''));
      continue;
    }

    lines.push(line);
  }

  if (!defaultValue)
    return source;

  const mergeable = MERGEABLE_WITH_NAMESPACE.has(declarations.get(defaultValue));
  const namespaceMembers = [
    ...(mergeable ? [`${defaultValue} as default`] : []),
    ...exportedNames.filter(name => mergeable || declarations.get(name) === 'interface' ||
      declarations.get(name) === 'type'),
  ].filter((member, index, members) => members.indexOf(member) === index);

  const namespace = namespaceMembers.length > 0 ? `

declare namespace ${defaultValue} {
  export { ${namespaceMembers.join(', ')} };
}` : '';
  return `${lines.join('\n').trimEnd()}${namespace}
export = ${defaultValue};
`;
}

/**
 * Packages that publish types only through the ESM `import` condition.
 *
 * A `.d.cts` resolves `import type ... from '<dep>'` through `<dep>`'s
 * `require` condition. When that condition has no useful named types (vite's
 * `index.d.cts` is `declare const module: any; export = module`), the import
 * fails with TS2305. Rewriting just those specifiers with an import attribute
 * forces TypeScript to resolve them as ESM while keeping the declaring file CJS.
 *
 * Caveat: import attributes need TypeScript >= 5.3 to parse. Non-strict
 * projects on TS 4.7-5.2 previously got no error here (implicit any) and now
 * get a syntax error, so `@pwrs/vite-plugin-lit-css` effectively requires
 * TypeScript >= 5.3 for CommonJS consumers.
 */
const ESM_ONLY_TYPE_DEPENDENCIES = ['vite'];

function rewriteEsmOnlyTypeImports(source) {
  return ESM_ONLY_TYPE_DEPENDENCIES.reduce((text, dep) => {
    const specifier = dep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Declaration files carry no runtime imports, so rewriting every
    // import/export-from clause is safe here. The lookahead keeps the rewrite
    // idempotent. Value-level `import('dep')` type queries are not handled.
    const pattern = new RegExp(
      `((?:import|export)\\s[^;]*?\\sfrom\\s+)(['"])${specifier}\\2(?!\\s*with\\b)`,
      'g',
    );
    return text.replace(pattern, `$1$2${dep}$2 with { 'resolution-mode': 'import' }`);
  }, source);
}

/**
 * Emit CommonJS-flavoured declarations (`.d.cts`) alongside the ESM `.d.ts` files.
 *
 * TypeScript derives a declaration file's module format from its extension, so
 * CommonJS consumers resolving the `require` condition need `*.d.cts`. `tsc`
 * only emits that extension for a `.cts` source, and each package here has a
 * single ESM source, so the declarations are derived from the ESM output.
 *
 * Two transformations happen:
 *
 * 1. Imports of ESM-only type dependencies gain a `resolution-mode` attribute
 *    (see `ESM_ONLY_TYPE_DEPENDENCIES`).
 * 2. When the package has a default export, its declarations are rewritten to
 *    `export =` so `require()` returns the factory itself rather than an
 *    `{ default, ... }` object. Named exports, including their types, move into
 *    a namespace merged with the value, and `default` is re-exported there so
 *    existing `require('pkg').default` code keeps its types. The runtime
 *    bundles get an equivalent interop footer (see `CJS_INTEROP_FOOTER`).
 *
 * `filter` scopes the run to one package (by name or directory basename). The
 * self-built packages call this with their own name so a workspace-scoped
 * `npm run build -w <pkg>` also emits its `.d.cts`.
 */
export async function cjsTypes({ root = dirname(fileURLToPath(import.meta.url)), filter } = {}) {
  const errors = [];
  let matched = 0;
  for (const pkgPath of await globby('packages/*/package.json', { cwd: root, absolute: true })) {
    const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
    if (filter && pkg.name !== filter && basename(dirname(pkgPath)) !== filter)
      continue;
    matched++;
    const entry = pkg.exports?.['.'];
    const requireCondition = entry?.require;
    const importCondition = entry?.import;
    const cjsTypesFile = typeof requireCondition === 'string' ? undefined : requireCondition?.types;
    const esmTypesFile =
      (typeof importCondition === 'string' ? undefined : importCondition?.types) ?? pkg.types;
    const hasCjsBuild =
      typeof requireCondition === 'string' || conditionTarget(requireCondition) != null;

    if (!cjsTypesFile) {
      // Packages that expose no CJS build at all are intentionally skipped, but
      // a CJS build without declarations is a packaging bug.
      if (hasCjsBuild)
        errors.push(`${pkg.name}: exports["."].require.types is missing`);
      continue;
    }

    if (!esmTypesFile) {
      errors.push(`${pkg.name}: cannot determine the ESM types path`);
      continue;
    }

    const outdir = dirname(pkgPath);
    const sourcePath = resolve(outdir, esmTypesFile);
    const targetPath = resolve(outdir, cjsTypesFile);
    if (sourcePath === targetPath) {
      errors.push(`${pkg.name}: require.types and import.types resolve to the same file`);
      continue;
    }
    const expectedTarget = sourcePath.replace(/\.d\.ts$/, '.d.cts');
    if (expectedTarget === sourcePath || targetPath !== expectedTarget) {
      errors.push(`${pkg.name}: require.types is not the .d.cts twin of import.types`);
      continue;
    }
    let source;
    try {
      source = await readFile(sourcePath, 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT')
        throw error;
      errors.push(`${pkg.name}: ${esmTypesFile} is missing — run \`npm run build\` first`);
      continue;
    }
    await writeFile(targetPath, toCommonJsDeclaration(rewriteEsmOnlyTypeImports(source)));
  }
  if (filter && matched === 0)
    errors.push(`filter '${filter}' matched no packages (expected a package name or dir)`);
  return { errors };
}

async function cli() {
  const flagIndex = process.argv.indexOf('--cjs-types');
  const runtimeIndex = process.argv.indexOf('--runtime');
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    // eslint-disable-next-line no-console
    console.log(`Usage:
  node build.js                    build runtime bundles with esbuild
  node build.js --runtime [pkg]    build runtime bundles for one package only
  node build.js --cjs-types [pkg]  derive CommonJS declarations (*.d.cts)
                                   pkg: package name or packages/<dir> basename`);
  } else if (flagIndex !== -1) {
    const filter = process.argv.slice(flagIndex + 1).find(arg => !arg.startsWith('-'));
    const { errors } = await cjsTypes(filter ? { filter } : {});
    for (const error of errors)
      // eslint-disable-next-line no-console
      console.error(error);
    if (errors.length > 0)
      process.exitCode = 1;
  } else if (runtimeIndex !== -1) {
    const filter = process.argv.slice(runtimeIndex + 1).find(arg => !arg.startsWith('-'));
    await main(filter ? { filter } : {});
  } else
    main();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  cli();
