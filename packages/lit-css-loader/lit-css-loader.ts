import type { LoaderContext } from 'webpack';
import type { Options } from '@pwrs/lit-css/lit-css';
import { transform } from '@pwrs/lit-css';

export type LitCSSOptions = Omit<Options, 'css'>;

type Context = LoaderContext<{ options: LitCSSOptions }>;

export default function loader(this: Context, css: string): void {
  const callback = this.async();
  const { specifier, tag, uglify, ...rest } = this.getOptions().options ?? {};
  transform({ css, specifier, tag, uglify, ...rest })
    .then(result => callback(null, result))
    .catch(err => callback(err));
}
