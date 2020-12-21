module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:testing-library/react',
    'plugin:jest-dom/recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    node: true,
  },
  rules: {
    'react/jsx-no-target-blank': 0,
  },
};
