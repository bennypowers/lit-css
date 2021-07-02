import type { LoaderContext } from 'webpack';
import { transform, Options } from '@pwrs/lit-css';

export type LitCSSOptions = Omit<Options, 'css'>;

export default function loader(this: LoaderContext<LitCSSOptions>, css: string): string {
  const { specifier, tag, uglify } = this.getOptions().options ?? {};
  return transform({ css, specifier, tag, uglify });
}
