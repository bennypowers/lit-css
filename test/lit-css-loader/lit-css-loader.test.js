import { compiler } from './compiler.js';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { run } from '../test.js';

const dir = dirname(fileURLToPath(import.meta.url));

run({
  dir,
  name: 'lit-css-loader',
  async getCode(input, { options = {}, alias } = {}) {
    const { test, include, filter, ...rest } = options;
    try {
      const stats = await compiler({ input, test, alias, options: rest });
      const [, { source }] = stats.toJson({ source: true }).modules;
      return source;
    } catch (e) {
      const [{ message }] = e;
      throw new Error(message);
    }
  },
});
