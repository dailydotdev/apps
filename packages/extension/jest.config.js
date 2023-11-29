module.exports = {
  roots: ['<rootDir>'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  setupFilesAfterEnv: ['./__tests__/setup.ts'],
  testPathIgnorePatterns: [
    './.next/',
    './node_modules/',
    '<rootDir>/__tests__/setup.ts',
    '<rootDir>/__tests__/helpers/',
    '<rootDir>/__tests__/fixture/',
  ],
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!@dailydotdev)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/__mocks__/svgrMock.ts',
    '\\.css$': 'identity-obj-proxy',
    'react-markdown': '<rootDir>/__mocks__/reactMarkdownMock.tsx',
  },
};
