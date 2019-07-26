const fs = require('fs');
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const basedir = path.join(__dirname, 'src');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    widget: path.join(__dirname, 'src', 'widget.ts'),
  },
  output: {
    path: path.join(__dirname, 'public')
  },
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              url: false
            }
          },
          { loader: 'sass-loader' }
        ]
      },
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: { }
          }
        ]
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: { minimize: false }
          }
        ]
      },
      {
        test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
        loader: 'url-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.scss', '.css', '.html', '.svg', '.png', '.jpeg', '.jpg', '.gif'],
    alias: {
      handlebars: 'handlebars/dist/handlebars.js'
    }
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "./index.html",
      inject: false
    }),
    new CopyPlugin([
      { from: 'src/widgets/', to: 'widgets/' }
    ])
  ],
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    compress: true,
    port: 9000,
    writeToDisk: true,
    host: 'volunteerscotland-search.local',
    https: {
      key: fs.readFileSync(path.join(__dirname, '../http/test-cert/_wildcard.local-key.pem')),
      cert: fs.readFileSync(path.join(__dirname, '../http/test-cert/_wildcard.local.pem'))
    },
    allowedHosts: [
      'scvo.local',
      'volunteerscotland-search.local',
      'localhost'
    ]
  }
};