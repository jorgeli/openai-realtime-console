import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

export default {
  entry: {
    bundle: './client/mount.js'
  },
  output: {
    path: path.resolve('dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './client/index.html',
      filename: 'index.html',
      inject: true
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'client/base.css', to: 'base.css' },
        { from: 'client/assets', to: 'assets' }
      ]
    })
  ],
  devServer: {
    static: {
      directory: path.join('dist'),
    },
    compress: true,
    port: 3000,
  },
}; 