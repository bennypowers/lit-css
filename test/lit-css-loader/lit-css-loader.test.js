import { compiler } from './compiler.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { run } from '../test.js';

const dir = dirname(fileURLToPath(import.meta.url));

async function getCode(input, options = {}) {
  const stats = await compiler(input, options).catch(console.log);
  const [,{ source }] = stats.toJson({ source: true }).modules;
  return source;
}

run({ name: 'lit-css-loader', getCode, dir })
