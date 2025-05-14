import type { Options } from '@pwrs/lit-css/lit-css';
import type { TransformerExtras, PluginConfig } from 'ts-patch';

import { URL, pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';

import postcss, { type Processor as PostCSSProcessor, type Plugin as PostCSSPlugin } from 'postcss';
import nesting from 'postcss-nesting';
import cssnanoPresetDefault from 'cssnano-preset-default';

import ts, { ImportDeclaration, SourceFile } from 'typescript';

export interface LitCSSOptions extends Pick<Options, 'specifier'|'filePath'|'tag'> {
  filter: string;
  cssnano: boolean;
  inline: boolean;
}

const isPlugin = (x: PostCSSPlugin|PostCSSProcessor): x is PostCSSPlugin => 'postcssPlugin' in x;

const cssnanoPreset = cssnanoPresetDefault();

const asyncPlugins = [
  'postcss-svgo',
  'css-declaration-sorter',
];

const cssnanoSyncPlugins = cssnanoPreset.plugins
  // replicate the `initializePlugin` behavior from https://github.com/cssnano/cssnano/blob/a566cc5/packages/cssnano/src/index.js#L8
  .map(([creator, pluginConfig]) => creator(pluginConfig))
  .filter(plugin => isPlugin(plugin) && !asyncPlugins.includes(plugin.postcssPlugin));

const SEEN_SOURCES = new WeakSet();

function createLitCssImportStatement(
  ctx: ts.CoreTransformationContext,
  sourceFile: ts.SourceFile,
  specifier: string,
  tag: string,
) {
  if (SEEN_SOURCES.has(sourceFile))
    return;

  // eslint-disable-next-line easy-loops/easy-loops
  for (const statement of sourceFile.statements) {
    if (
      ts.isImportDeclaration(statement) &&
      statement.moduleSpecifier.getText() === specifier) {
      // eslint-disable-next-line easy-loops/easy-loops
      for (const binding of statement.importClause?.namedBindings?.getChildren() ?? []) {
        if (binding.getText() === tag) {
          SEEN_SOURCES.add(sourceFile);
          return;
        }
      }
    }
  }

  SEEN_SOURCES.add(sourceFile);

  return ctx.factory.createImportDeclaration(
    undefined,
    ctx.factory.createImportClause(
      false,
      undefined,
      ctx.factory.createNamedImports([
        ctx.factory.createImportSpecifier(
          false,
          undefined,
          ctx.factory.createIdentifier('css')
        ),
      ]),
    ),
    ctx.factory.createStringLiteral(specifier),
  );
}

function createLitCssTaggedTemplateLiteral(
  ctx: ts.CoreTransformationContext,
  stylesheet: string,
  name: string,
  tag: string,
) {
  return ctx.factory.createVariableStatement(
    undefined,
    ctx.factory.createVariableDeclarationList([
      ctx.factory.createVariableDeclaration(
        name ?? 'style',
        undefined,
        undefined,
        ctx.factory.createTaggedTemplateExpression(
          ctx.factory.createIdentifier(tag),
          undefined,
          ctx.factory.createNoSubstitutionTemplateLiteral(stylesheet),
        )
      ),
    ], ts.NodeFlags.Const)
  );
}

const getProcessedStylesheet = (content: string, pluginConfig: PluginConfig & LitCSSOptions) =>
  postcss([
    nesting,
    ...pluginConfig.cssnano ? cssnanoSyncPlugins : [],
  ]).process(content).css;

function createInline(
  node: ts.ImportDeclaration | ts.ExportDeclaration,
  importedStyleSheetSpecifier: string,
  pluginConfig: PluginConfig & LitCSSOptions,
  ctx: ts.TransformationContext,
) {
  const tagPkgSpecifier = pluginConfig.specifier ?? 'lit';
  const tag = pluginConfig.tag ?? 'css';
  const { fileName } = node.getSourceFile();
  const dir = pathToFileURL(fileName);
  const url = new URL(importedStyleSheetSpecifier, dir);
  const content = readFileSync(url, 'utf-8');

  const stylesheet = getProcessedStylesheet(content, pluginConfig);

  const litTagImportStatement =
    createLitCssImportStatement(ctx, node.getSourceFile(), tagPkgSpecifier, tag);

  if (ts.isImportDeclaration(node)) {
    const importBinding = node.importClause.name.getText();
    const literal = createLitCssTaggedTemplateLiteral(ctx, stylesheet, importBinding, tag);
    return [litTagImportStatement, literal];
  } else {
    if (ts.isNamespaceExport(node.exportClause))
      throw new Error('namespace exports are not supported');
    else if (ts.isNamedExports(node.exportClause)) {
      return [
        litTagImportStatement,
        createLitCssTaggedTemplateLiteral(ctx, stylesheet, 'styles', tag),
        ctx.factory.createExportDeclaration(
          null,
          false,
          ctx.factory.createNamedExports(node.exportClause.elements.map(element => {
            if (element.name.getText() === 'default')
              return (ctx.factory.createExportSpecifier(false, 'styles', 'default'));
            else {
              const propertyName = element.name.getText();
              const name = element.propertyName?.getText() ?? 'styles';
              return ctx.factory.createExportSpecifier(false, propertyName, name);
            }
          }))
        ),
      ];
    }
  }
}

function createModuleDecls(
  node: ts.ImportDeclaration | ts.ExportDeclaration,
  ctx: ts.TransformationContext,
  importedStyleSheetSpecifier: string,
) {
  if (ts.isImportDeclaration(node)) {
    return ctx.factory.createImportDeclaration(
      node.modifiers,
      node.importClause,
      ctx.factory.createStringLiteral(`${importedStyleSheetSpecifier}.js`)
    );
  } else if (!ts.isNamedExports(node.exportClause))
    throw new Error('namespace export unsupported');
  else {
    const importDecl = ts.addSyntheticLeadingComment(
      ctx.factory.createImportDeclaration(
        node.modifiers,
        ctx.factory.createImportClause(
          false,
          undefined,
          ctx.factory.createNamedImports(
            node.exportClause.elements
              .map(specifier =>
                ctx.factory.createImportSpecifier(
                  false,
                  ctx.factory.createIdentifier(specifier.name.getText()),
                  ctx.factory.createIdentifier(specifier.name.getText()),
                ),
              ),
          ),
        ),
        ctx.factory.createStringLiteral(`${importedStyleSheetSpecifier}.js`),
      ),
      ts.SyntaxKind.SingleLineCommentTrivia,
      'typescript-transform-lit-css',
    );

    const exportDecl = ctx.factory.createExportDeclaration(
      [],
      false,
      node.exportClause,
    );

    const newLine = ts.addSyntheticLeadingComment(
      ctx.factory.createIdentifier('\n'),
      ts.SyntaxKind.SingleLineCommentTrivia,
      'end typescript-transform-lit-css',
    );

    return [importDecl, exportDecl, newLine];
  }
}

/**
 * Replace .css import specifiers with .css.js import specifiers
 */
export default function(
  _program: ts.Program,
  pluginConfig: PluginConfig & LitCSSOptions,
  { ts }: TransformerExtras,
) {
  const tagPkgSpecifier = pluginConfig.specifier ?? 'lit';
  const tag = pluginConfig.tag ?? 'css';
  return (ctx: ts.TransformationContext) => {
    function visitor(node: ts.Node) {
      /* eslint-disable operator-linebreak */
      if (!ts.isTypeOnlyImportOrExportDeclaration(node)
        && (ts.isImportDeclaration(node) || ts.isExportDeclaration(node))
        // TODO: handle cases like `import { style as foo } from './x.css'; export { foo as bar };`
        && node.moduleSpecifier
      ) {
      /* eslint-enable operator-linebreak */
        const importedStyleSheetSpecifier =
          node.moduleSpecifier.getText().replace(/^'(.*)'$/, '$1');
        if (importedStyleSheetSpecifier.endsWith('.css')) {
          if (pluginConfig.inline)
            return createInline(node, importedStyleSheetSpecifier, pluginConfig, ctx);
          else
            return createModuleDecls(node, ctx, importedStyleSheetSpecifier);
        }
      }
      return ts.visitEachChild(node, visitor, ctx);
    }

    return (sourceFile: SourceFile) => {
      const children: ts.Node[] = [];
      sourceFile.forEachChild(node => children.push(node));
      const decl = (children.find(x =>
        !ts.isTypeOnlyImportOrExportDeclaration(x) &&
        !ts.isNamespaceImport(x) &&
        ts.isImportDeclaration(x) &&
        x.moduleSpecifier.getText() === tagPkgSpecifier &&
        x.importClause?.namedBindings
      )) as ImportDeclaration;

      const litImportBindings = decl?.importClause?.namedBindings;

      const hasStyleImports = children.find(x =>
        ts.isImportDeclaration(x) && x.moduleSpecifier.getText().endsWith('.css'));

      if (hasStyleImports) {
        if (litImportBindings &&
            ts.isNamedImports(litImportBindings) &&
            !litImportBindings.elements?.some(x => x.getText() === tag)) {
          ctx.factory.updateNamedImports(
            litImportBindings,
            [
              ...litImportBindings.elements,
              ctx.factory.createImportSpecifier(
                false,
                undefined,
                ctx.factory.createIdentifier(tag),
              ),
            ]
          );
        }
      }
      return ts.visitEachChild(sourceFile, visitor, ctx);
    };
  };
}
