/* global __dirname, require, module*/

const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const path = require('path');
const env = require('yargs').argv.env; // use --env with webpack 2

let libraryName = 'koalambda';

let plugins = [], outputFile;

if (env === 'build') {
  plugins.push(new UglifyJsPlugin());
  outputFile = libraryName + '.min.js';
} else {
  outputFile = libraryName + '.js';
}

const config = {
  entry: __dirname + '/src/index.ts',
  devtool: 'source-map',
  target: 'node',
  output: {
    path: __dirname + '/lib',
    filename: 'index.js',
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        loader: 'ts-loader'
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    modules: [path.resolve('./node_modules'), path.resolve('./src')],
    extensions: ['.json', '.js', '.ts']
  },
  plugins: plugins
};

module.exports = config;
