/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const sharedPackage = require('../shared/package.json');

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
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        presets: ['next/babel'],
        plugins: [
          'dynamic-import-node',
          [
            require.resolve('babel-plugin-module-resolver'),
            {
              root: ['.'],
              alias: {
                // Required to remove duplicate dependencies from the build
                ...Object.keys(sharedPackage.peerDependencies).reduce(
                  (acc, dep) => {
                    if (['react', 'react-dom'].find((name) => name === dep)) {
                      return {
                        ...acc,
                        [dep]: path.resolve('./node_modules/preact/compat'),
                      };
                    }
                    return {
                      ...acc,
                      [dep]: path.resolve(`./node_modules/${dep}`),
                    };
                  },
                  {},
                ),
              },
            },
          ],
        ],
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!@dailydotdev)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/__mocks__/svgrMock.ts',
    '\\.css$': 'identity-obj-proxy',
  },
};
