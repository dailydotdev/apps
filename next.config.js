const withPreact = require('next-plugin-preact');
const withPWA = require('next-pwa');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withPWA({
  pwa: {
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
  },
  ...withPreact(
    withBundleAnalyzer({
      webpack: (config) => {
        config.module.rules.push({
          test: /icons\/.*\.svg$/,
          exclude: /node_modules/,
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
    }),
  ),
});
