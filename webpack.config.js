const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
    template: './src/index.html',
    filename: 'index.html',
    inject: 'body',
});

module.exports = {
  entry: './src/index.js',
  devServer: {
    contentBase: './dist/',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index_bundle.js',
  },
  module: {
      loaders: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(html)$/,
          use: {
            loader: 'html-loader',
            options: {
              attrs: [':data-src']
            }
          }
        },
      ]
   },
  plugins: [
    HtmlWebpackPluginConfig,
    new HtmlWebpackPlugin({  // Also generate a test.html
      filename: 'demo2.html',
      template: './src/demo2.html',
      inject: 'body',
    })
  ]
}
