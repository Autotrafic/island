import * as webpack from 'webpack';
import * as webpackDevServer from 'webpack-dev-server';
import path from 'path';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import Dotenv from 'dotenv-webpack';

module.exports = (env: any, argv: any) => {
  return {
    mode: (process.env.NODE_ENV as 'production' | 'development' | undefined) ?? 'development',

    entry: env.copy_order ? './src/modules/copy-order/index.tsx' : './src/modules/upload-customer-files/index.tsx',

    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
      publicPath:
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:5100/'
          : env.copy_order
          ? 'https://copy-order.onrender.com'
          : 'https://upload-customer-files.onrender.com/',
    },

    module: {
      rules: [
        {
          test: /.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader'],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[path][name].[ext]',
              },
            },
          ],
        },
      ],
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },

    devServer: {
      port: 5300,
      historyApiFallback: true,
      hot: true,
      open: true,
      static: {
        directory: path.resolve(__dirname, 'dist'),
      },
    },

    plugins: [
      new CopyWebpackPlugin({
        patterns: [{ from: 'public' }],
      }),
      new Dotenv({
        path: path.resolve(__dirname, '.env'),
      }),
    ],
  };
};
