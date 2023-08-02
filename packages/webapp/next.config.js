/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const withPWA = require('next-pwa');
const withTM = require('next-transpile-modules')(['@dailydotdev/shared']);
const sharedPackage = require('../shared/package.json');
const { version } = require('../extension/package.json');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withTM(
  withPWA({
    pwa: {
      dest: 'public',
      disable: process.env.NODE_ENV === 'development',
    },
      ...withBundleAnalyzer({
        i18n: {
          locales: ["en"],
          defaultLocale: "en",
        },
        compiler: {
          reactRemoveProperties: { properties: ['^data-testid$'] },
        },
        webpack5: true,
        webpack: (config, { dev, isServer }) => {
          config.module.rules.push({
            test: /\.svg$/i,
            issuer: /\.[jt]sx?$/,
            use: [
              {
                loader: '@svgr/webpack',
                options: {
                  icon: true,
                  svgo: true,
                  replaceAttrValues: {
                    '#fff': 'currentcolor',
                    '#FFF': 'currentcolor',
                    '#FFFFFF': 'currentcolor',
                  },
                  svgProps: {
                    className: 'icon',
                  },
                },
              },
            ],
          });
          config.module.rules.push({
            test: /\.m?js/,
            resolve: {
              fullySpecified: false,
            },
          });
          config.resolve.alias = {
            ...config.resolve.alias,
            // Required to remove duplicate dependencies from the build
            ...Object.keys(sharedPackage.peerDependencies).reduce(
              (acc, dep) => {
                // if (['react', 'react-dom'].find((name) => name === dep)) {
                //   return {
                //     ...acc,
                //     [dep]: path.resolve('./node_modules/preact/compat'),
                //   };
                // }
                return { ...acc, [dep]: path.resolve(`./node_modules/${dep}`) };
              },
              {},
            ),
          };

          return config;
        },
        env: {
          CURRENT_VERSION: `'${version}'`
        },
        rewrites: () => [
          {
            source: '/api/:path*',
            destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
          },
        ],

        poweredByHeader: false,
        reactStrictMode: false,
        productionBrowserSourceMaps: process.env.SOURCE_MAPS === 'true',
      }),
  }),
);
