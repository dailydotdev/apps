module.exports = {
  roots: ['<rootDir>'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  setupFilesAfterEnv: ['./__tests__/setup.ts'],
  testPathIgnorePatterns: [
    './.next/',
    './node_modules/',
    '<rootDir>/__tests__/setup.ts',
    '<rootDir>/__tests__/helpers/',
    '<rootDir>/__tests__/fixture/',
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!.*(@dailydotdev|@tiptap|prosemirror-|node-emoji|@sindresorhus|@marsidev))',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^node-emoji$': '<rootDir>/../shared/node_modules/node-emoji/lib/index.cjs',
    '\\.svg$': '<rootDir>/__mocks__/svgrMock.ts',
    '\\.css$': 'identity-obj-proxy',
    'react-markdown': '<rootDir>/__mocks__/reactMarkdownMock.tsx',
  },
};
