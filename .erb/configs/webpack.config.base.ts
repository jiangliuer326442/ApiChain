/**
 * Base webpack config used across other specific configs
 */

import { theme } from 'antd';
import webpack from 'webpack';
import TsconfigPathsPlugins from 'tsconfig-paths-webpack-plugin';
import webpackPaths from './webpack.paths';
import { dependencies as externals } from '../../release/app/package.json';

const { getDesignToken } = theme;
const globalToken = getDesignToken();

const configuration: webpack.Configuration = {
  externals: [...Object.keys(externals || {})],

  stats: 'errors-only',

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            // Remove this line to enable type checking in webpack builds
            transpileOnly: true,
            compilerOptions: {
              module: 'esnext',
            },
          },
        },
      },
      {  
        test: /\.less$/,  
        use: [  
            'style-loader',  
            'css-loader',  
            'less-loader',  
            {  
                loader: 'less-loader',  
                options: {  
                    lessOptions: {  
                        modifyVars: globalToken,  
                        javascriptEnabled: false,  
                    },  
                },  
            },  
        ],  
      },  
    ],
  },

  output: {
    path: webpackPaths.srcPath,
    // https://github.com/webpack/webpack/issues/1114
    library: {
      type: 'commonjs2',
    },
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [webpackPaths.srcPath, 'node_modules'],
    // There is no need to add aliases here, the paths in tsconfig get mirrored
    plugins: [
      new TsconfigPathsPlugins(),
    ],
    fallback: {
      path: require.resolve("path-browserify")
    }
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),
    new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
    }),
  ],
};

export default configuration;
