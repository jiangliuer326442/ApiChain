/**
 * Build config for electron renderer process
 */

import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { merge } from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import baseConfig from './webpack.config.base';
import webpackPaths from './webpack.paths';
import checkNodeEnv from '../scripts/check-node-env';
import deleteSourceMaps from '../scripts/delete-source-maps';

checkNodeEnv('production');
deleteSourceMaps();

const configuration: webpack.Configuration = {
  devtool: false,

  mode: 'production',

  target: ['web', 'electron-renderer'],

  entry: [path.join(webpackPaths.srcRendererPath, 'index.tsx')],

  output: {
    path: webpackPaths.distRendererPath,
    publicPath: './',
    filename: '[name].js',
    library: {
      type: 'umd',
    },
  },

  module: {
    rules: [
      {
        test: /\.s?(a|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: true,
              importLoaders: 1,
            },
          },
          'sass-loader',
        ],
        include: /\.module\.s?(c|a)ss$/,
      },
      {
        test: /\.s?(a|c)ss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        exclude: /\.module\.s?(c|a)ss$/,
      },
      // Fonts
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      // Images
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      // SVG
      {
        test: /\.svg$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              prettier: false,
              svgo: false,
              svgoConfig: {
                plugins: [{ removeViewBox: false }],
              },
              titleProp: true,
              ref: true,
            },
          },
          'file-loader',
        ],
      },
    ],
  },

  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // 删除所有的 `console` 语句
            drop_debugger: true, // 删除所有的 `debugger` 语句
          },
          output: {
            comments: false, // 删除所有的注释
          },
        },
      }), 
      new CssMinimizerPlugin()
    ],
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/, // 匹配 node_modules 中的模块
          name: 'vendors',
          chunks: 'all', // 所有类型的 chunk（同步/异步）
          priority: 10, // 优先级高于默认的 common chunk
        },
      },
    },
  },

  plugins: [
    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      DEBUG_PROD: false,
      UPGRADE_CHECK: !((process.env.CHAT_PROVIDER || "") == "ZHAOHANG")
    }),

    new MiniCssExtractPlugin({
      filename: 'style.css',
    }),

    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(webpackPaths.srcRendererPath, 'index.ejs'),
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true,
      },
      isBrowser: false,
      isDevelopment: false,
    }),

    new webpack.DefinePlugin({
      'process.type': '"renderer"',
    }),
  ],
};

export default merge(baseConfig, configuration);
