import { createServer } from 'vite';
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const cssFile = resolve('src/styles.css');
const originalCSS = readFileSync(cssFile, 'utf8');

async function test() {
  const server = await createServer({
    configFile: resolve('vite.config.js'),
    server: { port: 0 },
  });

  await server.listen();

  try {
    // Transform the entry to populate the module graph
    const entryModule = await server.transformRequest('src/my-element.js');
    if (!entryModule) throw new Error('Could not transform entry module');

    // Verify the virtual module exists in the module graph
    const resolvedCssPath = resolve(cssFile);
    const virtualId = `\0${resolvedCssPath}.lit-css.js`;
    const mod = server.moduleGraph.getModuleById(virtualId);
    if (!mod) throw new Error('Virtual module not found in module graph');
    console.log('OK: Virtual module found in module graph');

    // Wait for watcher to settle, then modify the CSS
    await new Promise(r => setTimeout(r, 500));
    writeFileSync(cssFile, ':host { display: block; outline: 4px solid red; }\n');

    // Wait for the module to be invalidated (transformResult nulled out)
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error('HMR timeout - virtual module was not invalidated')),
        5000,
      );
      const interval = setInterval(() => {
        const currentMod = server.moduleGraph.getModuleById(virtualId);
        if (currentMod && currentMod.transformResult === null) {
          clearTimeout(timeout);
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
    console.log('OK: HMR invalidated the virtual module after CSS change');

    // Verify updated content is served
    const updated = await server.transformRequest(mod.url, { forceTransform: true });
    if (!updated?.code.includes('solid red'))
      throw new Error('Transformed module does not contain updated CSS');
    console.log('OK: Transformed module contains updated CSS');

    console.log('\nAll HMR tests passed!');
  } finally {
    writeFileSync(cssFile, originalCSS);
    await server.close();
  }
}

test().catch(e => {
  console.error(`FAIL: ${e.message}`);
  process.exit(1);
});
