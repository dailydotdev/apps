const withPreact = require('next-plugin-preact');
const withPWA = require('next-pwa');
const withTM = require('next-transpile-modules')(['@dailydotdev/shared']);

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withTM(
  withPWA({
    pwa: {
      dest: 'public',
      disable: process.env.NODE_ENV === 'development',
    },
    ...withPreact(
      withBundleAnalyzer({
        webpack5: true,
        webpack: (config, { isServer }) => {
          config.module.rules.push({
            test: /\.svg$/i,
            issuer: /\.[jt]sx?$/,
            use: ['@svgr/webpack'],
          });
          config.module.rules.push({
            test: /\.m?js/,
            resolve: {
              fullySpecified: false,
            },
          });

          if (!isServer) {
            config.externals = {
              next: 'next',
              react: 'React',
              'react-dom': 'ReactDOM',
            };
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
