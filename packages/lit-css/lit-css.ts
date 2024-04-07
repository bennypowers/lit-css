import cssnano, { Options as CssnanoOptions } from 'cssnano';

function stringToTemplateLiteral(x = '') {
  x = `${x}`;
  const escaped = x.replace(/\\|`|\$(?={)|(?<=<)\//g, y => `\\${y}`);
  return `\`${escaped}\``;
}

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
   * Whether to minify the CSS using cssnano. can also be an object of css nano options.
   * @default false
   */
  cssnano?: boolean|CssnanoOptions;
  /**
   * Transform sources using tools like sass or postcss
   * @param  source         Source file contents e.g. scss or postcss sources
   * @param  meta           Source file absolute (i.e. resolved) path
   * @return                Transformed, standard CSS
   */
  transform?(source: string, meta: Meta): string|Promise<string>;
}

async function cssnanoify(css: string, options: boolean|CssnanoOptions) {
  const cssnanoOptions = typeof options === 'object' ? options : undefined;
  const result = await cssnano(cssnanoOptions).process(css);
  return result.css;
}

export async function transform({
  css: source,
  filePath,
  specifier = 'lit',
  tag = 'css',
  cssnano = false,
  transform = x => x,
}: Options): Promise<string> {
  const css = await transform(source, { filePath });
  const cssContent =
      cssnano ? await cssnanoify(css, cssnano)
    : css;
  return `import {${tag}} from '${specifier}';
export const styles = ${tag}${stringToTemplateLiteral(cssContent)};
export default styles;
`;
}
