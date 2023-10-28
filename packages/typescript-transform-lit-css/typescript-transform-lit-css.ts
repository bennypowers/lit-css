import type { Options } from '@pwrs/lit-css/lit-css';
import type { TransformerExtras, PluginConfig } from 'ts-patch';

import fs from 'node:fs';
import { URL, pathToFileURL } from 'node:url';

import CleanCSS from 'clean-css';

import ts, { ImportDeclaration, SourceFile } from 'typescript';

export interface LitCSSOptions extends Pick<Options, 'specifier'|'filePath'|'tag'> {
  filter: string;
  uglify: boolean;
  inline: boolean;
}

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

/**
 * @param {string} stylesheet
 * @param {string} filePath
 */
function minifyCss(stylesheet: string, filePath: string) {
  try {
    const clean = new CleanCSS({ returnPromise: false });
    const { styles } = clean.minify(stylesheet);
    return styles;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('Could not minify ', filePath);
    // eslint-disable-next-line no-console
    console.error(e);
    return stylesheet;
  }
}

/**
 * Replace .css import specifiers with .css.js import specifiers
 */
export default function(
  program: ts.Program,
  pluginConfig: PluginConfig & LitCSSOptions,
  extras: TransformerExtras,
) {
  const tagPkgSpecifier = pluginConfig.specifier ?? 'lit';
  const tag = pluginConfig.tag ?? 'css';
  return (ctx: ts.TransformationContext) => {
    function visitor(node: ts.Node) {
      if (ts.isImportDeclaration(node) && !node.importClause?.isTypeOnly) {
        const importedStyleSheetSpecifier =
          node.moduleSpecifier.getText().replace(/^'(.*)'$/, '$1');
        if (importedStyleSheetSpecifier.endsWith('.css')) {
          if (pluginConfig.inline) {
            const { fileName } = node.getSourceFile();
            const dir = pathToFileURL(fileName);
            const url = new URL(importedStyleSheetSpecifier, dir);
            const content = fs.readFileSync(url, 'utf-8');
            const stylesheet = pluginConfig.uglify ? minifyCss(content, url.pathname) : content;
            return [
              createLitCssImportStatement(
                ctx,
                node.getSourceFile(),
                tagPkgSpecifier,
                tag,
              ),
              createLitCssTaggedTemplateLiteral(
                ctx,
                stylesheet,
                node.importClause?.name?.getText(),
                tag,
              ),
            ];
          } else {
            return ctx.factory.createImportDeclaration(
              node.modifiers,
              node.importClause,
              ctx.factory.createStringLiteral(`${importedStyleSheetSpecifier}.js`)
            );
          }
        }
      }
      return ts.visitEachChild(node, visitor, ctx);
    }

    return (sourceFile: SourceFile) => {
      const children = sourceFile.getChildren();

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
