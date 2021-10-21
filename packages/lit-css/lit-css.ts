import stringToTemplateLiteral from 'string-to-template-literal';

import { processString, UglifyCSSOptions } from 'uglifycss';

export interface Meta {
  /**
   * Path to the source file being transformed
   * Typically passed to transform functions e.g.
   * @example
   * ```js
   * (data, { filePath }) =>
   *   Sass.renderSync(data, { file: filePath }).css.toString()
   * ```
   */
  filePath: string;
}

export interface Options {
  /** CSS to transform */
  css: string;
  /** Absolute (i.e. resolved) path to the css file */
  filePath?: string;
  /**
   * Module specifier that exports the template tag.
   * @default 'lit'
   */
  specifier?: string;
  /**
   * Template tag to use, also the name of the export from the specified module
   * @default 'css'
   */
  tag?: string;
  /**
   * Whether to uglify the CSS. Can also be an object of uglifycss options
   * @default false
   */
  uglify?: boolean|UglifyCSSOptions;
  /**
   * Transform sources using tools like sass or postcss
   * @param  source         Source file contents e.g. scss or postcss sources
   * @param  meta           Source file absolute (i.e. resolved) path
   * @return                Transformed, standard CSS
   */
  transform?(source: string, meta: Meta): string|Promise<string>;
}

export async function transform({
  css: source,
  filePath,
  specifier = 'lit',
  tag = 'css',
  uglify = false,
  transform = x => x,
}: Options): Promise<string> {
  const css = await transform(source, { filePath });
  const uglifyOptions = typeof uglify === 'object' ? uglify : undefined;
  const cssContent = !uglify ? css : processString(css, uglifyOptions);
  return `import {${tag}} from '${specifier}';
export const styles = ${tag}${stringToTemplateLiteral(cssContent)};
export default styles;
`;
}
