import type { LoaderContext, LoaderDefinitionFunction } from 'webpack';
import type { Options } from '@pwrs/lit-css/lit-css';
import { transform } from '@pwrs/lit-css';

export type LitCSSOptions = Omit<Options, 'css'>;

type Context = LoaderContext<LitCSSOptions>;

const loader: LoaderDefinitionFunction = function loader(this: Context, css): void {
  const callback = this.async();
  const filePath = this.resourcePath;
  const options = this.getOptions();
  const { specifier, tag, ...rest } = options ?? {};
  transform({ css, specifier, tag, filePath, ...rest })
    .then(result => {
      callback(null, result);
    })
    .catch(err => {
      callback(err, css);
    });
};

export default loader;
