// @ts-check

import webpack from 'webpack';

import { fileURLToPath } from 'url';
import { resolve, join, dirname } from 'path';
import { createFsFromVolume, Volume } from 'memfs';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * @param  {string} fixture
 * @param  {import('../../packages/lit-css-loader/lit-css-loader').LitCSSOptions} [options={}]
 */
export const compiler = (path, options = {}, { test = /\.css$/i } = {}) => {
  const compiler = webpack({
    mode: 'development',
    context: resolve(__dirname, '..', 'fixtures'),
    entry: `./${path}`,
    output: {
      path: resolve(__dirname),
      filename: 'bundle.js',
    },
    externals: { snoot: 'snoot' },
    optimization: {
      minimize: false,
    },
    ...!!options.alias && { resolve: { alias: options.alias } },
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
      if (err) reject(err);
      if (stats.hasErrors()) reject(stats.toJson().errors);
      resolve(stats);
    });
  });
};
