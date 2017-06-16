const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const webpack = require('webpack')
const fs = require('fs')

const guiEntries =
  fs.readdirSync('src')
    .filter(f => f.match(/.*\.tsx$/))
    .map(f => path.join('src', f))
    .reduce((memo, file) => {
      memo[path.basename(file, path.extname(file))] = path.resolve(file)
      return memo
    }, {})

const commonConfig = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: 'pre',
        loader: 'tslint-loader',
        options: {
          typeCheck: true,
          emitErrors: true
        }
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        loader: 'standard-loader',
        options: {
          typeCheck: true,
          emitErrors: true
        }
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader'
      },
      {
        test: /\.tsx?$/,
        loader: ['babel-loader', 'ts-loader']
      }
    ]
  },
  node: {
    __dirname: false
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.jsx', '.json']
  }
}

module.exports = [
  Object.assign(
    {
      target: 'electron-main',
      entry: { main: './src/main.ts' },
      plugins: [ new webpack.SourceMapDevToolPlugin({ filename: '[name].js.map' }) ]
    },
    commonConfig),
  Object.assign(
    {
      target: 'electron-renderer',
      entry: guiEntries,
      plugins: [
        new CleanWebpackPlugin(['dist'], { exclude: ['main.js'] }),
        new webpack.SourceMapDevToolPlugin({ filename: '[name].js.map' }),
        ...Object.keys(guiEntries).map(k => new HtmlWebpackPlugin({ filename: `${k}.html`, chunks: [k], template: fs.existsSync(`src/${k}.ejs`) ? `src/${k}.ejs` : 'src/default.ejs' }))
      ]
    },
    commonConfig)
]
