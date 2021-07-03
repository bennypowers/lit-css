import type { LoaderContext } from 'webpack';
import type { Options } from '@pwrs/lit-css/lit-css';
import { transform } from '@pwrs/lit-css';

export type LitCSSOptions = Omit<Options, 'css'>;

type Context = LoaderContext<{ options: LitCSSOptions }>;

export default function loader(this: Context, css: string): string {
  const { specifier, tag, uglify } = this.getOptions().options ?? {};
  return transform({ css, specifier, tag, uglify });
}
