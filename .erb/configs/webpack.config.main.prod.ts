/**
 * Webpack config for production electron main process
 */

import path from 'path';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { path7za } from '7zip-bin';
import baseConfig from './webpack.config.base';
import webpackPaths from './webpack.paths';
import checkNodeEnv from '../scripts/check-node-env';
import deleteSourceMaps from '../scripts/delete-source-maps';

checkNodeEnv('production');
deleteSourceMaps();

const plugins = [
  new webpack.EnvironmentPlugin({
    NODE_ENV: 'production',
    DEBUG_PROD: false,
    START_MINIMIZED: false,
    UPGRADE_CHECK: !((process.env.CHAT_PROVIDER || "") == "ZHAOHANG")
  }),

  new webpack.DefinePlugin({
    'process.type': '"browser"',
  }),
];

const copy_zip = process.env.TS_NODE_COPY_ZIP || false;
if (copy_zip) {
  plugins.push(new CopyWebpackPlugin({
    patterns: [
      {
        from: path7za,
        to: '7zip-bin/7za[ext]',
      },
    ],
  }));
}

const configuration: webpack.Configuration = {
  devtool: false,

  mode: 'production',

  target: 'electron-main',

  entry: {
    main: path.join(webpackPaths.srcMainPath, 'main.ts'),
    preload: path.join(webpackPaths.srcMainPath, 'preload.ts'),
  },

  output: {
    path: webpackPaths.distMainPath,
    filename: '[name].js',
    library: {
      type: 'umd',
    },
  },

  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // 删除所有的 `console` 语句
            drop_debugger: true, // 删除所有的 `debugger` 语句
          },
          output: {
            comments: false, // 删除所有的注释
          },
        },
        parallel: true,
      }),
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

  plugins,

  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false,
  },
};

export default merge(baseConfig, configuration);
