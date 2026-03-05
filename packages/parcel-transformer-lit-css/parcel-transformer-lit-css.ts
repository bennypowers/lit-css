import { Transformer } from '@parcel/plugin';
import type { Options } from '@pwrs/lit-css';

import { transform } from '@pwrs/lit-css';

export type LitCSSOptions = Omit<Options, 'css'>

export default new Transformer({
  async loadConfig({ config }) {
    const { contents } = await config.getConfig(['package.json'], {});
    return contents?.['lit-css'];
  },

  async transform({ asset, config }) {
    const css = await asset.getCode();
    const options = (config as LitCSSOptions) || {};

    try {
      const code = await transform({
        css,
        filePath: asset.filePath,
        ...options,
      });

      asset.type = 'js';
      asset.setCode(code);

      return [asset];
    } catch (error) {
      throw new Error(error?.message ?? String(error));
    }
  },
});
