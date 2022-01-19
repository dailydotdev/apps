/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const withPreact = require('next-plugin-preact');
const withPrefresh = require('@prefresh/next');
const withPWA = require('next-pwa');
const withTM = require('next-transpile-modules')(['@dailydotdev/shared']);
const sharedPackage = require('../shared/package.json');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withTM(
  withPWA({
    pwa: {
      dest: 'public',
      disable: process.env.NODE_ENV === 'development',
    },
    ...withPrefresh(
      withBundleAnalyzer({
        webpack5: true,
        experimental: {
          modern: true,
          // polyfillsOptimization: true,
        },
        webpack: (config, { dev, isServer }) => {
          const splitChunks =
            config.optimization && config.optimization.splitChunks;
          if (splitChunks) {
            const cacheGroups = splitChunks.cacheGroups;
            const preactModules =
              /[\\/]node_modules[\\/](preact|preact-render-to-string|preact-context-provider)[\\/]/;
            if (cacheGroups.framework) {
              cacheGroups.preact = Object.assign({}, cacheGroups.framework, {
                test: preactModules,
              });
              cacheGroups.commons.name = 'framework';
            } else {
              cacheGroups.preact = {
                name: 'commons',
                chunks: 'all',
                test: preactModules,
              };
            }
          }

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
                if (['react', 'react-dom'].find((name) => name === dep)) {
                  return {
                    ...acc,
                    [dep]: path.resolve('./node_modules/preact/compat'),
                  };
                }
                return { ...acc, [dep]: path.resolve(`./node_modules/${dep}`) };
              },
              {},
            ),
          };

          // inject Preact DevTools
          if (dev && !isServer) {
            const entry = config.entry;
            config.entry = () =>
              entry().then((entries) => {
                entries['main.js'] = ['preact/debug'].concat(
                  entries['main.js'] || [],
                );
                return entries;
              });
          }

          return config;
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
    ),
  }),
);
