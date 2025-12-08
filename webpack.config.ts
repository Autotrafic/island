import * as webpack from 'webpack';
import * as webpackDevServer from 'webpack-dev-server';
import path from 'path';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import Dotenv from 'dotenv-webpack';

module.exports = (env: any, argv: any) => {
  let entry = './src/modules/upload-customer-files/index.tsx';
  let publicPath = 'https://upload-customer-files.onrender.com/';

  if (env.copy_order) {
    entry = './src/modules/copy-order/index.tsx';
    publicPath = 'https://copy-order.onrender.com';
  } else if (env.leads_uploader) {
    entry = './src/modules/leads-uploader/index.tsx';
    publicPath = 'https://leads.autotrafic.es/';
  } else if (env.whatsapp) {
    entry = './src/modules/whatsapp/index.tsx';
    publicPath = 'https://whatsapp.autotrafic.es/';
  }

  return {
    mode: (process.env.NODE_ENV as 'production' | 'development' | undefined) ?? 'development',

    entry,

    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: process.env.NODE_ENV === 'development' ? 'http://localhost:5100/' : publicPath,
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
          test: /\.(png|jpe?g|gif|svg|mp3|wav|ogg)$/i,
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
