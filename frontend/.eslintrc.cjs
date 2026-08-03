module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: { react: { version: 'detect' } },
  plugins: ['react-refresh'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    // eslint-plugin-react-hooks@7 promoted this to an error by default. It correctly
    // flags real anti-patterns (e.g. syncing a prop into state), but it also flags the
    // "call load() on mount" pattern used throughout this codebase's data-fetching
    // hooks/pages, which is a legitimate, common way to kick off an initial fetch.
    // Keep it visible as a warning (CI does not fail on warnings) rather than silencing
    // it outright, so real derived-state bugs are still easy to spot over time.
    'react-hooks/set-state-in-effect': 'warn',
  },
};
