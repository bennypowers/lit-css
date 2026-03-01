#!/usr/bin/env node
import { symlinkSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const target = join(rootDir, 'test', 'mock-packages', 'snoot');
const link = join(rootDir, 'node_modules', 'snoot');

if (!existsSync(link)) {
  try {
    symlinkSync(target, link, 'dir');
    // eslint-disable-next-line no-console
    console.log('✓ Created symlink for mock package: snoot');
  } catch (error) {
    // Ignore errors (e.g., symlink already exists, permission denied in CI)
    if (error.code !== 'EEXIST')
      // eslint-disable-next-line no-console
      console.warn('⚠ Could not create symlink for snoot:', error.message);
  }
}
