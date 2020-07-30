module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': 'error',
  },
  overrides: [
    {
      files: ['migrations/*.ts', 'seeds/*.ts', 'scripts/*.ts'],
      extends: 'eslint:recommended',
      parserOptions: {
        sourceType: 'module',
      },
    },
    {
      files: ['migrations/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 0,
      },
    },
  ],
  env: {
    node: true,
  },
};
