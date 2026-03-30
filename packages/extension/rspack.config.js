/* eslint-disable @typescript-eslint/no-var-requires, import/no-extraneous-dependencies */
const path = require('path');
const rspack = require('@rspack/core');
const FilemanagerPlugin = require('filemanager-webpack-plugin');
const WextManifestWebpackPlugin = require('wext-manifest-webpack-plugin');
const dotenv = require('dotenv');
const fs = require('fs');
const { version } = require('./package.json');

const viewsPath = path.join(__dirname, 'views');
const sourcePath = path.join(__dirname, 'src');
const destPath = path.join(__dirname, 'dist');
const nodeEnv = process.env.NODE_ENV || 'development';
const targetBrowser = process.env.TARGET_BROWSER;

const getExtensionFileType = (browser) => {
  if (browser === 'opera') {
    return 'crx';
  }

  if (browser === 'firefox') {
    return 'xpi';
  }

  return 'zip';
};

const baseConfig = {
  devtool: false,

  stats: {
    all: false,
    builtAt: true,
    errors: true,
    hash: true,
  },

  mode: nodeEnv,

  output: {
    publicPath: '',
    path: path.join(destPath, targetBrowser),
    filename: 'js/[name].bundle.js',
  },

  resolve: {
    extensions: ['.svg', '.ts', '.tsx', '.js', '.json'],
    alias: {
      'react-onesignal': false,
      '@marsidev/react-turnstile': false,
      '@paddle/paddle-js': false,
    },
    fallback: {
      fs: false,
      zlib: false,
      stream: false,
    },
  },

  module: {
    rules: [
      {
        test: /icons(\/|\\).*\.svg$/,
        exclude: /node_modules(\/|\\)(?!@dailydotdev)/,
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
      },
      {
        type: 'javascript/auto',
        test: /manifest\.json$/,
        use: {
          loader: 'wext-manifest-loader',
          options: {
            usePackageJSONVersion: true,
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(js|ts)x?$/,
        exclude: /node_modules(\/|\\)(?!@dailydotdev)/,
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: {
              syntax: 'typescript',
              tsx: true,
            },
            transform: {
              react: {
                runtime: 'automatic',
              },
            },
          },
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        exclude: /node_modules(\/|\\)(?!@dailydotdev)/,
        use: [
          rspack.CssExtractRspackPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
          },
          'resolve-url-loader',
        ],
      },
    ],
  },

  plugins: [
    new WextManifestWebpackPlugin(),
    // Fallback: delete manifest JS bundle if the plugin didn't catch it under rspack
    {
      apply(compiler) {
        compiler.hooks.afterEmit.tap('CleanManifestJs', () => {
          const file = path.join(compiler.outputPath, 'js/manifest.bundle.js');
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
          }
        });
      },
    },
    ...(process.env.NODE_ENV === 'production'
      ? []
      : [new rspack.SourceMapDevToolPlugin({ filename: false })]),
    new rspack.EnvironmentPlugin(['NODE_ENV', 'TARGET_BROWSER']),
    new rspack.DefinePlugin({
      'process.env.CURRENT_VERSION': `'${version}'`,
      ...Object.fromEntries(
        Object.entries(
          dotenv.config({
            path:
              process.env.NODE_ENV === 'production'
                ? './.env.production'
                : './.env',
          }).parsed || {},
        ).map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)]),
      ),
      // Stub process.env so undefined vars resolve to undefined instead of
      // crashing with "process is not defined" (same as dotenv-webpack)
      'process.env': '"MISSING_ENV_VAR"',
    }),
    new rspack.HtmlRspackPlugin({
      template: path.join(viewsPath, 'newtab.html'),
      inject: 'body',
      chunks: ['newtab'],
      hash: true,
      filename: 'index.html',
    }),
    new rspack.HtmlRspackPlugin({
      template: path.join(viewsPath, 'companion.html'),
      inject: 'body',
      chunks: ['companion'],
      hash: true,
      filename: 'companion.html',
    }),
    new rspack.HtmlRspackPlugin({
      template: path.join(viewsPath, 'frame.html'),
      inject: 'body',
      chunks: ['frame'],
      hash: true,
      filename: 'frame.html',
    }),
    new rspack.CssExtractRspackPlugin({ filename: 'css/[name].css' }),
    new rspack.CopyRspackPlugin({
      patterns: [{ from: 'public', to: '.' }],
    }),
  ],

  optimization: process.env.NODE_ENV === 'production' ? {} : {},
};

const backgroundConfig = {
  ...baseConfig,
  target: 'webworker',
  output: {
    ...baseConfig.output,
    clean: true,
  },
  entry: {
    background: path.join(sourcePath, 'background', 'index.ts'),
  },
};

const mainConfig = {
  ...baseConfig,
  entry: {
    manifest: {
      import: path.join(sourcePath, 'manifest.json'),
      runtime: false,
    },
    content: { import: path.join(sourcePath, 'content'), runtime: false },
    companion: {
      import: path.join(sourcePath, 'companion', 'index.tsx'),
      runtime: false,
    },
    frame: {
      import: path.join(sourcePath, 'frame', 'index.ts'),
      runtime: false,
    },
    newtab: {
      import: path.join(sourcePath, 'newtab', 'index.tsx'),
      runtime: 'runtime',
    },
  },
  plugins: [
    ...baseConfig.plugins,
    ...(process.env.NODE_ENV === 'production'
      ? [
          new FilemanagerPlugin({
            events: {
              onEnd: {
                archive: [
                  {
                    format: 'zip',
                    source: path.join(destPath, targetBrowser),
                    destination: `${path.join(
                      destPath,
                      targetBrowser,
                    )}.${getExtensionFileType(targetBrowser)}`,
                    options: { zlib: { level: 6 } },
                  },
                ],
              },
            },
          }),
        ]
      : []),
  ],
  optimization: {
    ...baseConfig.optimization,
    splitChunks: {
      chunks(chunk) {
        return !['content', 'companion', 'manifest'].includes(chunk.name);
      },
      maxSize: 244000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
};

module.exports = [backgroundConfig, mainConfig];
