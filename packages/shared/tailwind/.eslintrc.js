module.exports = {
  rules: {
    '@typescript-eslint/no-var-requires': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
  },
};
