/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const webpack = require('webpack');
const FilemanagerPlugin = require('filemanager-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WextManifestWebpackPlugin = require('wext-manifest-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const Dotenv = require('dotenv-webpack');
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
  devtool: false, // https://github.com/webpack/webpack/issues/1194#issuecomment-560382342

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
        type: 'javascript/auto', // prevent webpack handling json with its own loaders,
        test: /manifest\.json$/,
        use: {
          loader: 'wext-manifest-loader',
          options: {
            usePackageJSONVersion: true, // set to false to not use package.json version for manifest
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(js|ts)x?$/,
        loader: 'babel-loader',
        exclude: /node_modules(\/|\\)(?!@dailydotdev)/,
      },
      {
        test: /\.(sa|sc|c)ss$/,
        exclude: /node_modules(\/|\\)(?!@dailydotdev)/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader, // It creates a CSS file per JS file which contains CSS
          },
          {
            loader: 'css-loader', // Takes the CSS files and returns the CSS with imports and url(...) for Webpack
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
          },
          'resolve-url-loader', // Rewrites relative paths in url() statements
        ],
      },
    ],
  },

  plugins: [
    // Plugin to not generate js bundle for manifest entry
    new WextManifestWebpackPlugin(),
    // Generate sourcemaps
    new webpack.SourceMapDevToolPlugin({ filename: false }),
    new ForkTsCheckerWebpackPlugin(),
    // environmental variables
    new webpack.EnvironmentPlugin(['NODE_ENV', 'TARGET_BROWSER']),
    new Dotenv({
      path:
        process.env.NODE_ENV === 'production' ? './.env.production' : './.env',
    }),
    new webpack.DefinePlugin({
      'process.env.CURRENT_VERSION': `'${version}'`,
    }),
    // delete previous build files
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        path.join(destPath, targetBrowser),
        path.join(
          destPath,
          `${targetBrowser}.${getExtensionFileType(targetBrowser)}`,
        ),
      ],
      cleanStaleWebpackAssets: false,
      verbose: true,
    }),
    new HtmlWebpackPlugin({
      template: path.join(viewsPath, 'newtab.html'),
      inject: 'body',
      chunks: ['newtab'],
      hash: true,
      filename: 'index.html',
    }),
    new HtmlWebpackPlugin({
      template: path.join(viewsPath, 'companion.html'),
      inject: 'body',
      chunks: ['companion'],
      hash: true,
      filename: 'companion.html',
    }),
    // write css file(s) to build folder
    new MiniCssExtractPlugin({ filename: 'css/[name].css' }),
    // copy static assets
    new CopyWebpackPlugin({
      patterns: [{ from: 'public', to: '.' }],
    }),
  ],

  optimization:
    process.env.NODE_ENV === 'production'
      ? {
          minimize: true,
          minimizer: [
            new TerserPlugin({
              parallel: true,
              terserOptions: {
                format: {
                  comments: false,
                },
              },
              extractComments: false,
            }),
            new CssMinimizerPlugin({
              minimizerOptions: {
                preset: ['default', { discardComments: { removeAll: true } }],
              },
            }),
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
                    {
                      format: 'zip',
                      source: path.resolve(path.join(__dirname, '../../')),
                      destination: `${path.join(destPath, 'src')}.zip`,
                      options: {
                        ignore: [
                          '**/*.zip',
                          '**/.idea/**',
                          '**/node_modules/**',
                          '**/dist/**',
                          '.git/**',
                          '**/.next/**',
                        ],
                        globOptions: {
                          dot: true,
                        },
                      },
                    },
                  ],
                },
              },
            }),
          ],
        }
      : {},
};

const backgroundConfig = {
  ...baseConfig,
  target: 'webworker',
  entry: {
    background: path.join(sourcePath, 'background', 'index.ts'),
  },
};

const mainConfig = {
  ...baseConfig,
  entry: {
    manifest: path.join(sourcePath, 'manifest.json'),
    content: path.join(sourcePath, 'content'),
    companion: path.join(sourcePath, 'companion', 'index.tsx'),
    newtab: path.join(sourcePath, 'newtab', 'index.tsx'),
  },
};

module.exports = [backgroundConfig, mainConfig];
