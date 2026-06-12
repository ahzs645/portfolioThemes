import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

const browserGlobals = {
  console: 'readonly',
  document: 'readonly',
  fetch: 'readonly',
  history: 'readonly',
  indexedDB: 'readonly',
  localStorage: 'readonly',
  location: 'readonly',
  matchMedia: 'readonly',
  MutationObserver: 'readonly',
  navigator: 'readonly',
  requestAnimationFrame: 'readonly',
  setInterval: 'readonly',
  setTimeout: 'readonly',
  clearInterval: 'readonly',
  clearTimeout: 'readonly',
  URL: 'readonly',
  window: 'readonly',
};

const nodeGlobals = {
  Buffer: 'readonly',
  process: 'readonly',
};

export default [
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      '.playwright-mcp/**',
      'test-results/**',
      'extracted/**',
      'public/**',
    ],
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: browserGlobals,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['scripts/**/*.js', '*.config.js'],
    languageOptions: {
      globals: {
        ...browserGlobals,
        ...nodeGlobals,
      },
    },
  },
];
