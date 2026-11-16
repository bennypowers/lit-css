import pwrs from '@pwrs/eslint-config';
import globals from 'globals';

export default [
  {
    ignores: [
      'node_modules/',
      'package-lock.json',
      'packages/*/test/expected/**',
      'packages/*/test/TSPC_OUTPUT/**',
      'packages/*/integration-test/**',
      'packages/*/*.js',
      'packages/*/*.cjs',
      'packages/*/*.js.map',
      'packages/*/*.cjs.map',
      'packages/*/*.d.ts',
      'packages/*/*.d.cts',
    ],
  },
  ...pwrs,
  {
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'no-invalid-this': 'off',
    },
  },
];
