// @ts-check

import webpack from 'webpack';

import { fileURLToPath } from 'url';
import { resolve, join, dirname } from 'path';
import { createFsFromVolume, Volume } from 'memfs';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * @param  {object} fixture
 * @param  {import('../../packages/lit-css-loader/lit-css-loader').LitCSSOptions} [options={}]
 */
export const compiler = ({
  input: path,
  test = /\.css$/,
  alias,
  options = {},
}) => {
  const compiler = webpack({
    mode: 'development',
    context: resolve(__dirname, '..', '😁-FIXTURES'),
    entry: `./${path}`,
    output: {
      path: resolve(__dirname),
      filename: 'bundle.js',
    },
    externals: {
      'lit': 'lit',
      '@microsoft/fast-element': 'fast',
      'snoot': 'snoot',
    },
    optimization: {
      minimize: false,
    },
    ...!!alias && { resolve: { alias } },
    module: {
      rules: [
        {
          test,
          loader: 'lit-css-loader',
          options,
        },
      ],
    },
  });

  compiler.outputFileSystem = createFsFromVolume(new Volume());
  compiler.outputFileSystem.join = (...args) => join(...args);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err)
        return reject(err);
      else if (stats.hasErrors())
        return reject(stats.toJson().errors);
      else
        return resolve(stats);
    });
  });
};
